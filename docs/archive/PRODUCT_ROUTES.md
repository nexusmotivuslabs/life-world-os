# Product Routes - Internal Application Features

## Overview
Products are **internal features/components** of the Master Money System app, accessed via routes within the same application. They are not separate external services.

## Product Route Structure

### Internal Routes
- **url**: Internal route path (e.g., `/products/portfolio-tracker`)
- **accessUrl**: User-facing route path (e.g., `/master-money/products/portfolio-tracker`)
- Products are accessed via React Router navigation within the same app

### Example Routes
- Portfolio Tracker: `/master-money/products/portfolio-tracker`
- ROI Calculator: `/master-money/products/roi-calculator`
- Emergency Fund Tracker: `/master-money/products/emergency-fund-tracker`

## Navigation

Products are accessed using React Router's `navigate()` function:
```typescript
navigate(product.accessUrl!) // e.g., '/master-money/products/portfolio-tracker'
```

## Security Model (Unchanged)

Security remains critical even though products are internal:
- Security Specialist agents still lead security implementation
- Security procedures and documentation remain the same
- Security information displayed to users before accessing products
- Authentication, encryption, and compliance still apply

## Key Points

1. **Same Application**: Products are features within the Master Money System app
2. **Internal Routes**: Accessed via React Router navigation, not external links
3. **Security Still Critical**: Users trust the system with financial data - security measures apply
4. **Consistent UX**: Products feel like integrated features, not separate apps

## Implementation

- Frontend uses React Router for navigation
- Products accessed via `navigate()` function
- Security information displayed before access
- All products part of the same application system

