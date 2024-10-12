from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import jwt
from datetime import datetime, timedelta  
from sqlalchemy import ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import bcrypt
from flask_bcrypt import check_password_hash
import enum
import os

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'rzawsedrtyuioyi764321345678sfdfghjke32qw4e5ryt'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
db = SQLAlchemy(app)

# Define the Users model
class Users(db.Model):
    __tablename__ = 'users'

    usersid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    profile = relationship("Profile", back_populates="user")
    user_bag = relationship("UserBag", back_populates="user")
    user_wishlist = relationship("UserWishlist", back_populates="user")

class Profile(db.Model):
    __tablename__ = 'profile'
    id = db.Column(db.Integer, primary_key=True)
    usersid = db.Column(db.Integer, ForeignKey('users.usersid'))
    username = db.Column(db.String(100))
    email = db.Column(db.String(100))
    phone_number = db.Column(db.String(20))
    Home_no = db.Column(db.String(20))
    street_name = db.Column(db.String(100))
    district = db.Column(db.String(100))
    state = db.Column(db.String(100))
    nation = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.now)
    modified_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    modified_count = db.Column(db.Integer, default=1) 
    is_active = db.Column(db.Boolean, default=True)  
    user = relationship("Users", back_populates="profile")

class color(enum.Enum):
    red = 1
    black = 2
    blue = 3

class size(enum.Enum):
    s = 1
    m = 2
    l = 3

class ProductDetails(db.Model):
    __tablename__ = 'product_details'

    Product_detailID = db.Column(db.Integer, primary_key=True)
    CategoryID = db.Column(db.Integer, ForeignKey('categories.CategoryID'))
    size = db.Column(Enum(size))
    color = db.Column(Enum(color))
    count = db.Column(db.Integer)
    category = relationship("Category", back_populates="product_details")
    user_bag = relationship("UserBag", back_populates="product_details")
    user_wishlist = relationship("UserWishlist", back_populates="product_details")

class gender(enum.Enum):
    mens = 1
    women = 2

class Category(db.Model):
    __tablename__ = 'categories'

    CategoryID = db.Column(db.Integer, primary_key=True)
    gender = db.Column(Enum(gender))
    model = db.Column(db.String(10))
    description = db.Column(db.String(1000))
    price = db.Column(db.String(5))
    image = db.Column(db.String(100000))
    product_details = relationship("ProductDetails", back_populates="category")
    
class UserBag(db.Model):
    __tablename__ = 'user_bag'

    id = db.Column(db.Integer, primary_key=True)
    usersid = db.Column(db.Integer, ForeignKey('users.usersid'))
    productid = db.Column(db.Integer, ForeignKey('product_details.Product_detailID'))
    quantity = db.Column(db.Integer)
    size = db.Column(db.String)
    color = db.Column(db.String)
    modified_time = db.Column(db.DateTime, default=datetime.now)
    is_active = db.Column(db.Integer, default = 1) 

    user = relationship("Users", back_populates="user_bag")
    product_details = relationship("ProductDetails", back_populates="user_bag")

class UserWishlist(db.Model):
    __tablename__ = 'user_wishlist'

    id = db.Column(db.Integer, primary_key=True)
    usersid = db.Column(db.Integer, ForeignKey('users.usersid'))
    productid = db.Column(db.Integer, ForeignKey('product_details.Product_detailID'))
    modified_time = db.Column(db.DateTime, default=datetime.now)
    is_active = db.Column(db.Boolean, default=True) 

    user = relationship("Users", back_populates="user_wishlist")
    product_details = relationship("ProductDetails", back_populates="user_wishlist")

publicRoutes = ['login', 'signup']
def verify_token():
    if request.endpoint not in publicRoutes:
        token = request.headers.get('Authorization')
        if token:
            token = token.split('Bearer ')[1]
            try:
                decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
                userId = decoded_token.get('userId')
                request.user = db.session.query(Users).filter_by(usersid=userId).first()
                return userId
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token has expired'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Invalid token'}), 402
        else:
            return jsonify({'message': 'No token provided'}), 402

@app.route('/user_wishlist_add', methods=['POST'])
def add_to_user_wishlist():
    userId = verify_token()
    if userId:
        data = request.json
        product_id = data.get('productid')
        existing_wishlist_item = UserWishlist.query.filter_by(usersid=userId, productid=product_id, is_active = 1).first()
        if existing_wishlist_item:
            return jsonify({'error': 'Product already exists in the user\'s wishlist'}), 400

        new_entry = UserWishlist(
            usersid=userId,
            productid=product_id,
            modified_time=datetime.now()
        )

        db.session.add(new_entry)
        db.session.commit()

        return jsonify({'message': 'Product added to user wishlist successfully'}), 201
    else:
        return jsonify({'error': 'Unauthorized'}), 401

@app.route('/user_wishlist_get', methods=['GET'])
def get_user_wishlist():
    user_id = verify_token()
    try:
        user_wishlist = UserWishlist.query.filter_by(usersid=user_id, is_active = 1).all()
        
        if not user_wishlist:
            return jsonify({'message': 'User wishlist is empty'}), 200

        wishlist_items = []
        for item in user_wishlist:
            product = ProductDetails.query.get(item.productid)
            if product:
                category = Category.query.get(product.CategoryID)
                if category:
                    wishlist_item = {
                        'product_detail_id': product.Product_detailID,
                        'model': category.model,
                        'gender': str(category.gender),
                        'image': category.image,
                        'description': category.description,
                        'price': category.price

                    }
                    wishlist_items.append(wishlist_item)

        return jsonify(wishlist_items), 200
    except Exception as e:
        return jsonify({'error': f'Internal server error: {e}'}), 500
    
@app.route('/remove_user_wishlist', methods=['POST'])
def remove_user_wishlist():
    user_id = verify_token()
    if user_id:
        data = request.json
        product_id = data.get('productid')
        removed_item = UserWishlist.query.filter_by(usersid=user_id, productid=product_id, is_active = True).first()
        if removed_item:
            removed_item.is_active = False
            db.session.commit()
            return jsonify({'message': 'Product removed from user bag successfully'}), 200
        else:
            return jsonify({'error': 'Product not found in user bag'}), 404
    else:
        return jsonify({'error': 'Unauthorized access'}), 401

@app.route('/products/mens/<model>', methods=['GET'])
def products(model):
    query_result = db.session.query(ProductDetails, Category).join(Category).filter(Category.model == model).limit(6)
    products_with_categories = []
    for product_detail, category in query_result:
        product_data = {
            'product_detail_id': product_detail.Product_detailID,
            'category_id': product_detail.CategoryID,
            'size': str(product_detail.size),
            'color': str(product_detail.color),
            'count': product_detail.count,
            'gender': str(category.gender),
            'model': category.model,
            'description': category.description,
            'price': category.price,
            'image': category.image  
        }
        products_with_categories.append(product_data)
    return jsonify(products_with_categories)

@app.route('/products/women/<model>', methods=['GET'])
def product(model):
    query_result = db.session.query(ProductDetails, Category).join(Category).filter(Category.model == model).limit(6)
    products_with_categories = []
    for product_detail, category in query_result:
        product_data = {
            'product_detail_id': product_detail.Product_detailID,
            'category_id': product_detail.CategoryID,
            'size': str(product_detail.size),
            'color': str(product_detail.color),
            'count': product_detail.count,
            'gender': str(category.gender),
            'model': category.model,
            'description': category.description,
            'price': category.price,
            'image': category.image  
        }
        products_with_categories.append(product_data)
    return jsonify(products_with_categories)

@app.route('/user_bag_add', methods=['POST'])
def add_to_user_bag():
    userId = verify_token()
    if userId:
        data = request.json
        product_id = data.get('product_id')
        quantity = data.get('quantity')
        size = data.get('size')
        color = data.get('color')

        existing_bag_item = UserBag.query.filter_by(usersid=userId, productid=product_id, is_active = 1).first()

        if existing_bag_item:
            return jsonify({'error': 'Product already exists in the user\'s wishlist'}), 400
        
        new_entry = UserBag(
            usersid=userId,
            productid=product_id,
            quantity=quantity,
            size=size,
            color=color,
            modified_time=datetime.now()
        )
        db.session.add(new_entry)
        db.session.commit()
        return jsonify({'message': 'Product added to user bag successfully'}), 201
    
@app.route('/user_bag_get', methods=['GET'])
def get_from_user_bag():
    user_id = verify_token()
    try:
        user_bag = UserBag.query.filter_by(usersid=user_id, is_active = 1).all()

        if not user_bag:
            return jsonify({'message': 'User Bag is empty'}), 200
        bag_items = []
        for item in user_bag:
            product = ProductDetails.query.get(item.productid)
            if product:
                category = Category.query.get(product.CategoryID)
                if category:
                    bag_item = {
                        'product_detail_id': product.Product_detailID,
                        'color': item.color,
                        'size': item.size,
                        'quantity': item.quantity,
                        'image': category.image,
                        'model': category.model,
                        'description': category.description,
                        'gender': str(category.gender),
                        'price': category.price
                    }
                    bag_items.append(bag_item)
        return jsonify(bag_items), 200
    except Exception as e:
        return jsonify({'error': f'Internal server error: {e}'}), 500

@app.route('/user_bag_remove', methods=['POST'])
def remove_from_user_bag():
    user_id = verify_token()
    if user_id:
        data = request.json
        product_id = data.get('product_id')
        removed_item = UserBag.query.filter_by(usersid=user_id, productid=product_id, is_active = 1).first()
        if removed_item:
            removed_item.is_active = 0
            db.session.commit()
            return jsonify({'message': 'Product removed from user bag successfully'}), 200
        else:
            return jsonify({'error': 'Product not found in user bag'}), 404
    else:
        return jsonify({'error': 'Unauthorized access'}), 401
    
@app.route('/move_to_checkout', methods=['POST'])
def move_to_checkout():
    user_id = verify_token()
    if user_id:
        data = request.json
        product_id = data.get('product_ids')
        removed_item = UserBag.query.filter(UserBag.usersid == user_id, UserBag.productid.in_(product_id), UserBag.is_active == 1).all()
        if removed_item:
            for item in removed_item:
                item.is_active = 2
            db.session.commit()
            return jsonify({'message': 'This website is a poc... Thank you for your time'}), 200
        else:
            return jsonify({'error': 'Product not found in user bag'}), 404
    else:
        return jsonify({'error': 'Unauthorized access'}), 401
    
@app.route('/product', methods=['POST'])
def create_product():
    data = request.json

    category_id = data.get('CategoryID')
    size = data.get('size')
    color = data.get('color')
    count = data.get('count')

    new_product = ProductDetails(
        CategoryID=category_id,
        size=size,
        color=color,
        count=count
    )

    db.session.add(new_product)
    db.session.commit()

    return jsonify({'message': 'Product created successfully'}), 201

@app.route('/product', methods=['GET'])
def get_all_products():
    verify_token()
    products = ProductDetails.query.all()  
    result = []
    for product in products:
        product_data = {
            'Product_detailID': product.Product_detailID,
            'CategoryID': product.CategoryID,
            'size': str(product.size),
            'color': str(product.color),
            'count': product.count
        }
        result.append(product_data)
    return jsonify(result)

@app.route('/category', methods=['POST'])
def create_category():
    data = request.json

    gender = data.get('gender')
    model = data.get('model')
    description = data.get('description')
    price = data.get('price')
    image_data = data.get('image')

    new_category = Category(
        gender=gender,
        model=model,
        description=description,
        price=price,
        image=image_data
    )

    db.session.add(new_category)
    db.session.commit()

    return jsonify({'message': 'Category created successfully'}), 201

@app.route('/category', methods=['GET'])
def show_category():
    categories = Category.query.all()
    category_list = []
    for category in categories:
        category_data = {
            'gender': str(category.gender),
            'model': category.model,
            'description': category.description,
            'price': category.price,
            'image': category.image
        }
        category_list.append(category_data)
    return jsonify(category_list), 200

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    confirmPassword = data.get('confirmPassword')

    if password != confirmPassword:
        return jsonify({'error': "Passwords don't match"}), 400
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    new_user = Users(username=username, password=hashed_password)
    try:
        db.session.add(new_user)
        db.session.commit()
        user = db.session.query(Users).filter_by(username=username).first()
        expiration_time = datetime.now() + timedelta(hours=2)
        token = jwt.encode({'userId': user.usersid, 'exp': expiration_time}, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@app.route('/save_profile', methods=['POST'])
def save_profile():
    verify_token()
    data = request.json
    user = request.user
    username = user.username
    if user:
        data['usersid'] = user.usersid 
        existing_profile = db.session.query(Profile).filter_by(usersid=user.usersid).first()
        if existing_profile:
            existing_profile.modified_count += 1
            existing_profile.modified_at = datetime.now()  
            db.session.commit()
            new_profile = Profile(**data)
            db.session.add(new_profile)
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200
        else:
            profile = Profile(**data)
            db.session.add(profile)
            db.session.commit()
            return jsonify({'message': 'Profile saved successfully'}), 201
    else:
        return jsonify({'message': 'User not found'}), 404

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = db.session.query(Users).filter_by(username=username).first()
    if user:
        if check_password_hash(user.password, password):
            expiration_time = datetime.now() + timedelta(hours=2)
            token = jwt.encode({'userId': user.usersid, 'exp': expiration_time}, app.config['SECRET_KEY'], algorithm='HS256')
            return jsonify({'token': token}), 200
        else:
            return jsonify({'message': 'Invalid password'}), 401
    else:
        return jsonify({'message': 'User does not exist'}), 404

@app.route('/get_profile', methods=['GET'])
def get_profile():
    verify_token()
    user = request.user
    profile = db.session.query(Profile).filter_by(usersid=user.usersid, is_active = 1).first()
    try:
        if profile:
            data = {
                'username': profile.username,
                'email': profile.email,
                'phone_number': profile.phone_number,
                'Home_no': profile.Home_no,
                'street_name': profile.street_name,
                'district': profile.district,
                'state': profile.state,
                'nation': profile.nation
            }
            return jsonify(data), 200
        else:
            data = {
                'username': user.username,
                'email': '',
                'phone_number': '',
                'Home_no': '',
                'street_name': '',
                'district': '',
                'state': '',
                'nation': ''
            }
            return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': f'Internal server error: {e}'}), 500
    
@app.route('/get_all_profiles', methods=['GET'])
def get_all_profiles():
    verify_token()
    user = request.user
    profiles = db.session.query(Profile).filter_by(usersid=user.usersid, is_active = 1).all()
    try:
        if profiles:
            data = [{
                'username': profile.username,
                'email': profile.email,
                'phone_number': profile.phone_number,
                'Home_no': profile.Home_no,
                'street_name': profile.street_name,
                'district': profile.district,
                'state': profile.state,
                'nation': profile.nation
            } for profile in profiles]
            return jsonify(data), 200
        else:
            return jsonify({'message': 'No Profiles'}), 200
    except Exception as e:
        return jsonify({'error': f'Internal server error: {e}'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
    

