# Flash Deal Marketplace Frontend

A modern React-based frontend for the Flash Deal Marketplace application, built with React Router, TailwindCSS, and real-time WebSocket integration.

## Features

### 🔐 Authentication & Authorization
- **Login/Register** with role-based access (Admin, Seller, Buyer)
- **JWT Token** authentication with automatic token refresh
- **Protected Routes** with role-based access control
- **Persistent Authentication** using localStorage

### 🛍️ Buyer Features
- **Product Browsing** with search, filters, and pagination
- **Real-time Countdown Timers** for flash deals
- **Shopping Cart** with quantity management
- **Order Management** with status tracking
- **Real-time Notifications** for order updates and deal expiry

### 🏪 Seller Features
- **Product Management** - Add, edit, and track products
- **Order Management** - View and update order status
- **Real-time Notifications** for new orders
- **Product Approval Tracking**

### 👑 Admin Features
- **Product Approval** - Review and approve/reject seller products
- **Category Management** - CRUD operations for product categories
- **User Management** - View all registered users
- **Dashboard Analytics** with key metrics

### 🎨 UI/UX Features
- **Responsive Design** - Mobile-first approach with TailwindCSS
- **Modern UI Components** - Cards, modals, loading states
- **Toast Notifications** - Success, error, and info messages
- **Loading States** - Spinners and skeleton loaders
- **Real-time Updates** - WebSocket integration for live notifications

## Tech Stack

- **React 19** - Latest React with hooks
- **React Router v6** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time WebSocket communication
- **React Hot Toast** - Toast notifications
- **Formik** - Form handling and validation

## Project Structure

```
src/
├── api/                    # API service layer
│   ├── axiosConfig.js     # Axios configuration
│   ├── auth.js           # Authentication API
│   ├── products.js       # Products API
│   ├── categories.js     # Categories API
│   ├── cart.js          # Cart API
│   ├── orders.js        # Orders API
│   └── index.js         # API exports
├── components/           # Reusable UI components
│   ├── dashboard/       # Dashboard components
│   ├── Navbar.js       # Navigation component
│   ├── ProductCard.js  # Product display card
│   ├── LoadingSpinner.js # Loading component
│   └── ProtectedRoute.js # Route protection
├── context/            # State management
│   └── authStore.js    # Authentication store (Zustand)
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Authentication hook
│   ├── useCountdown.js # Countdown timer hook
│   └── useWebSocket.js # WebSocket hook
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── seller/         # Seller pages
│   ├── Login.js        # Login page
│   ├── Register.js     # Register page
│   ├── Dashboard.js    # Main dashboard
│   ├── Products.js     # Product listing
│   ├── Cart.js         # Shopping cart
│   └── Orders.js       # Order management
├── utils/              # Utility functions
│   └── helpers.js      # Helper functions
├── App.js              # Main app component
└── index.js            # App entry point
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Setup

The application expects the backend API to be running on `http://localhost:5000`. If your backend runs on a different port, update the `API_BASE_URL` in `src/api/axiosConfig.js`.

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users/me` - Get current user
- `GET /api/users` - Get all users (admin)

### Products
- `GET /api/products` - Get products with filters
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `GET /api/products/pending` - Get pending products (admin)
- `PUT /api/products/:id/approve` - Approve product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Cart & Orders
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add/update cart item
- `GET /api/orders` - Get buyer orders
- `GET /api/orders/seller` - Get seller orders
- `POST /api/orders` - Create order (checkout)
- `PUT /api/orders/:id/status` - Update order status (seller)

## WebSocket Events

The application listens for the following WebSocket events:

- `orderStatusUpdate` - Order status changes
- `dealExpiring` - Deal expiry notifications
- `newOrder` - New order notifications (sellers)
- `productApproved` - Product approval notifications
- `productRejected` - Product rejection notifications

## Role-Based Access

### Admin
- Access to all admin panels
- Product approval and rejection
- Category management
- User management

### Seller
- Product management
- Order tracking
- Sales analytics

### Buyer
- Product browsing
- Shopping cart
- Order history
- Deal notifications

## Key Features

### Real-time Updates
- WebSocket integration for live notifications
- Order status updates
- Deal expiry alerts
- New order notifications

### Responsive Design
- Mobile-first approach
- TailwindCSS for styling
- Modern UI components
- Accessibility considerations

### State Management
- Zustand for global state
- Persistent authentication
- Optimistic updates
- Error handling

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style
- ESLint configuration included
- Prettier for code formatting
- Consistent naming conventions
- Component-based architecture

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service

3. **Configure environment variables** if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.