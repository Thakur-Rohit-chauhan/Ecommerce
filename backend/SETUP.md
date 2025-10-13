# Backend Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your database credentials:
```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/database_name
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development
```

### 2. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Run migrations
alembic upgrade head

# Or use the auto-migration feature (runs on server start)
python run.py
```

### 4. Run the Server

```bash
# Development mode
python run.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `SECRET_KEY` | JWT secret key | - | ✅ |
| `ALGORITHM` | JWT algorithm | `HS256` | ❌ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `30` | ❌ |
| `ENVIRONMENT` | Environment mode | `development` | ❌ |

### User Roles

The system supports three user roles:

1. **Normal User** (`normal_user`) - Default role for new registrations
2. **Seller** (`seller`) - Can manage products and view orders
3. **Admin** (`admin`) - Full system access

### Security Features

- **SSL/TLS**: Automatically configured based on environment
- **JWT Authentication**: Ready for implementation
- **Input Validation**: Comprehensive Pydantic schemas
- **Error Handling**: Structured exception system

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   │   ├── user/       # User management
│   │   │   ├── models.py
│   │   │   ├── routes.py
│   │   │   ├── schema.py
│   │   │   └── service.py
│   │   ├── routes.py   # Auth routes (login, register)
│   │   └── utils.py    # Auth utilities (JWT, password hashing)
│   ├── orders/         # Order management
│   │   ├── models.py
│   │   ├── routes.py
│   │   ├── schema.py
│   │   └── service.py
│   ├── common/         # Shared utilities
│   │   ├── exceptions.py # Custom exception classes
│   │   └── response.py   # Response handlers
│   ├── config.py       # Configuration management
│   ├── db/            # Database setup
│   │   ├── main.py    # Database engine and session
│   │   └── auto_migrations.py # Auto-migration system
│   ├── middleware.py  # Security and logging middleware
│   ├── product/       # Product module
│   ├── category/      # Category module
│   └── cart/         # Cart module
├── alembic/          # Database migrations
├── requirements.txt  # Dependencies
├── .env.example     # Environment template
├── API_DOCUMENTATION.md # Complete API docs
└── SETUP.md         # This file
```

## 🔒 Security Improvements Applied

1. **Environment-based Configuration**: All sensitive data moved to environment variables
2. **SSL/TLS Configuration**: Proper SSL handling for production
3. **Input Validation**: Enhanced Pydantic schemas with proper constraints
4. **Error Handling**: Structured exception system with proper HTTP status codes
5. **Database Security**: Secure connection handling
6. **Type Safety**: Improved type hints and validation

## 🚨 Important Notes

- **Never commit `.env` files** to version control
- **Change default SECRET_KEY** in production
- **Use strong database passwords**
- **Enable SSL in production** environment
- **Regular security updates** for dependencies

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check `DATABASE_URL` format
   - Ensure database server is running
   - Verify credentials

2. **Import Errors**:
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt`

3. **Migration Issues**:
   - Check database permissions
   - Verify `DATABASE_URL` is correct
   - Run `alembic upgrade head` manually

### Getting Help

- Check the logs for detailed error messages
- Verify environment variables are set correctly
- Ensure all dependencies are installed
