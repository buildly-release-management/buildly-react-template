# Credit Card Processing Implementation Guide

## Overview

The Buildly React Template implements credit card processing using **Stripe** for subscription management and payment processing. This document outlines the complete implementation flow that other frontend developers should follow.

## Dependencies

The application uses the following Stripe packages:

```json
{
  "@stripe/react-stripe-js": "^1.16.2",
  "@stripe/stripe-js": "^1.46.0"
}
```

## Configuration

### Environment Variables

Add the Stripe public key to your environment configuration:

```javascript
// In your environment file
STRIPE_KEY=pk_test_your-stripe-public-key  // Test key
STRIPE_KEY=pk_live_your-stripe-public-key  // Production key
```

### Application Setup

The Stripe context is configured at the root level in `src/index.js`:

```javascript
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(window.env.STRIPE_KEY);

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </QueryClientProvider>,
);
```

## Core Components

### 1. StripeCard Component (`src/components/StripeCard/StripeCard.js`)

This is the reusable credit card form component:

```javascript
import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { FormControl, FormGroup, FormHelperText } from '@mui/material';

const StripeCard = ({ cardError, setCardError }) => {
  const onCardChange = (elementData) => {
    if (elementData.error) {
      setCardError(elementData.error.message);
    } else if (!elementData.complete) {
      setCardError('Card details cannot be empty');
    } else {
      setCardError('');
    }
  };

  return (
    <FormGroup>
      <FormControl>
        <CardElement onChange={onCardChange} />
      </FormControl>
      <FormHelperText>
        {cardError && cardError.message}
      </FormHelperText>
    </FormGroup>
  );
};

export default StripeCard;
```

### 2. Payment Processing Hook

Standard implementation for processing payments:

```javascript
import { useStripe, useElements } from '@stripe/react-stripe-js';

const usePaymentProcessing = () => {
  const stripe = useStripe();
  const elements = useElements();

  const processPayment = async (user, organization) => {
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement('card'),
      billing_details: {
        email: user.email,
        name: organization,
      },
    });

    return { error, paymentMethod };
  };

  return { processPayment };
};
```

## Implementation Pattern

### Step 1: Import Required Hooks

```javascript
import { useStripe, useElements } from '@stripe/react-stripe-js';
```

### Step 2: Initialize Stripe Hooks

```javascript
const MyComponent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(false);
  
  // ... rest of component
};
```

### Step 3: Form Validation

```javascript
const submitDisabled = () => {
  try {
    if (
      cardError ||
      !elements ||
      (elements && elements.getElement('card')._empty)
    ) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
};
```

### Step 4: Payment Processing

```javascript
const handleSubmit = async (event) => {
  event.preventDefault();
  let validationError = '';

  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: elements.getElement('card'),
    billing_details: {
      email: user.email,
      name: organization,
    },
  });
  
  validationError = error;

  const formValue = {
    product: product.value,
    card_id: paymentMethod?.id,
  };

  if (!validationError) {
    // Submit to your backend
    addSubscriptionMutation(formValue);
  } else {
    setCardError(validationError);
  }
};
```

### Step 5: Render the StripeCard Component

```javascript
return (
  <form onSubmit={handleSubmit}>
    {/* Other form fields */}
    
    <StripeCard
      cardError={cardError}
      setCardError={setCardError}
    />
    
    <Button
      type="submit"
      disabled={submitDisabled()}
      onClick={handleSubmit}
    >
      Submit Payment
    </Button>
  </form>
);
```

## Backend Integration

### API Endpoints

The app communicates with these backend endpoints:

1. **Create Subscription**: `POST ${window.env.API_URL}subscription/`
2. **Get Stripe Products**: `GET ${window.env.API_URL}subscription/stripe_products/`
3. **Cancel Subscription**: `DELETE ${window.env.API_URL}subscription/${subscription_uuid}`

### Subscription Mutation

```javascript
// src/react-query/mutations/authUser/addSubscriptionMutation.js
export const useAddSubscriptionMutation = (displayAlert, history, redirectTo) => useMutation(
  async (data) => {
    const response = await httpService.makeRequest(
      'post',
      `${window.env.API_URL}subscription/`,
      data, // { product: productId, card_id: paymentMethodId }
    );
    
    // Update user context after successful subscription
    const user = await httpService.makeRequest('get', `${window.env.API_URL}coreuser/me/`);
    oauthService.setOauthUser(user);
    
    return response.data;
  },
  {
    onSuccess: () => {
      displayAlert('success', 'Subscription successfully saved');
      if (redirectTo) history.push(redirectTo);
    },
    onError: () => {
      displayAlert('error', 'Couldn\'t save subscription!');
    },
  },
);
```

## Usage Examples

### 1. Registration Flow (`src/pages/RegistrationFinish/RegistrationFinish.js`)

Used for activating 30-day free trials:

```javascript
const RegistrationFinish = ({ history }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(false);
  const product = useInput('', { required: true });

  const handleSubmit = async () => {
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement('card'),
      billing_details: {
        email: user.email,
        name: organization,
      },
    });

    if (!error) {
      addSubscriptionMutation({
        product: product.value,
        card_id: paymentMethod.id,
      });
    }
  };

  return (
    <form>
      <TextField select value={product.value} onChange={product.bind.onChange}>
        {stripeProductData.map(prd => (
          <MenuItem key={prd.id} value={prd.id}>{prd.name}</MenuItem>
        ))}
      </TextField>
      
      <StripeCard cardError={cardError} setCardError={setCardError} />
      
      <Button onClick={handleSubmit} disabled={!product.value || cardError}>
        Submit
      </Button>
    </form>
  );
};
```

### 2. Subscription Management (`src/pages/UserProfile/Subscriptions/Subscriptions.js`)

Used for managing existing subscriptions:

```javascript
const Subscriptions = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  // Similar implementation for updating subscriptions
  // Include product selection and card processing
};
```

### 3. TopBar Quick Subscription (`src/layout/TopBar/TopBar.js`)

Inline subscription option in the app header:

```javascript
const TopBar = () => {
  // Similar pattern for quick subscription access
};
```

## Error Handling

### Card Validation Errors

```javascript
const onCardChange = (elementData) => {
  if (elementData.error) {
    setCardError(elementData.error.message);
  } else if (!elementData.complete) {
    setCardError('Card details cannot be empty');
  } else {
    setCardError('');
  }
};
```

### Payment Method Errors

```javascript
const { error, paymentMethod } = await stripe.createPaymentMethod({...});

if (error) {
  setCardError(error);
  displayAlert('error', 'Payment method creation failed');
  return;
}
```

## Security Best Practices

1. **Never store card details**: Stripe handles all sensitive data
2. **Use public keys only**: Never expose secret keys in frontend
3. **Validate on backend**: Always validate payments server-side
4. **Error handling**: Provide clear error messages to users
5. **Loading states**: Show loading indicators during processing

## Testing

### Test Cards

Use Stripe's test card numbers for development:

- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient funds**: `4000000000009995`

### Environment Setup

```javascript
// For development
STRIPE_KEY=pk_test_your-test-key

// For production
STRIPE_KEY=pk_live_your-live-key
```

## Key Files Reference

- **Root Setup**: `src/index.js`
- **Card Component**: `src/components/StripeCard/StripeCard.js`
- **Subscription Mutation**: `src/react-query/mutations/authUser/addSubscriptionMutation.js`
- **Product Query**: `src/react-query/queries/authUser/getStripeProductQuery.js`
- **Registration Example**: `src/pages/RegistrationFinish/RegistrationFinish.js`
- **Subscription Management**: `src/pages/UserProfile/Subscriptions/Subscriptions.js`

## Summary

This implementation provides a robust, secure credit card processing system using Stripe. The pattern is consistent across all payment flows in the application and should be replicated for any new payment functionality. The key is to always use the `StripeCard` component, follow the standard payment processing flow, and properly handle errors and loading states.
