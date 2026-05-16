# Lenskart Frontend - React Application

A complete React 18+ frontend for the Lenskart e-commerce platform with role-based authentication support for customers and administrators.

## Features

### Customer Features
- **Authentication**: Customer registration and login with secure password handling
- **Product Browsing**: View all products with filtering by brand, category, and price range
- **Product Details**: View detailed information about products
- **Shopping Cart**: Add products to cart, modify quantities, and manage cart items
- **Checkout**: Review order summary and delivery address before placing order
- **Order History**: View all past orders with status tracking (In Progress/Delivered)
- **Profile Management**: Update profile information, manage account details, and delete account

### Admin Features
- **Dashboard**: Overview of key metrics (products, orders, customers, admins)
- **Product Management**: Add, edit, and delete products
- **Category Management**: Add and manage product categories
- **Order Management**: View all orders and update order status
- **Customer Management**: View and manage customer accounts
- **Admin Management**: Add and manage other admin accounts
- **Profile Management**: Update admin profile information

## Tech Stack

- **React 18+**: Latest React with hooks and functional components
- **React Router v6**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Hook Form**: Efficient form handling
- **Zod**: TypeScript-first schema validation
- **Vite**: Lightning-fast build tool and development server

## Installation

1. **Clone or navigate to the project directory**:
```bash
cd /home/blade/IdeaProjects/lenskart-frontend
```

2. **Install dependencies**:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

Build the application for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx      # Navigation bar
│   └── ProtectedRoute.jsx  # Route protection wrapper
├── context/            # React Context for state management
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── LandingPage.jsx # Home page
│   ├── CustomerLogin.jsx
│   ├── CustomerRegister.jsx
│   ├── AdminLogin.jsx
│   ├── AdminRegister.jsx
│   ├── customer/       # Customer pages
│   │   ├── ProductListing.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderHistory.jsx
│   │   └── CustomerProfile.jsx
│   └── admin/          # Admin pages
│       ├── AdminDashboard.jsx
│       ├── ProductManagement.jsx
│       ├── CategoryManagement.jsx
│       ├── OrderManagement.jsx
│       ├── CustomerManagement.jsx
│       ├── AdminManagement.jsx
│       └── AdminProfile.jsx
├── services/           # API service
│   └── api.js         # Axios API configuration and endpoints
├── App.jsx            # Main app component with routing
├── main.jsx           # Application entry point
├── index.css          # Global styles with Tailwind
└── vite.config.js     # Vite configuration
```

## API Configuration

The application connects to the backend API at `http://localhost:8080`. Update the `API_BASE_URL` in `src/services/api.js` if your backend is hosted elsewhere.

## Authentication Flow

1. **User Registration**: Create new customer or admin account
2. **Login**: Authenticate using email and password via `/login` endpoint
3. **Session Storage**: User data (including role) stored in localStorage
4. **Role-Based Access**: Routes are protected based on user role (CUSTOMER/ADMIN)
5. **Auto-Logout**: Session cleared on logout

## Key Features

### Cart Management
- Products stored in localStorage
- Real-time quantity updates
- Cart summary with total calculations

### Order Management
- Place orders from cart
- Track order status (In Progress/Delivered)
- View order history with filtering

### Product Filters
- Filter by brand
- Filter by category
- Filter by price range
- Search by product name

### Responsive Design
- Mobile-first approach
- Fully responsive on all screen sizes
- Touch-friendly UI

## Error Handling

- Comprehensive error messages for API failures
- Form validation with helpful feedback
- Loading states during API calls
- User-friendly notifications for success/failure

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC

## Support

For issues or questions, please contact the development team.

