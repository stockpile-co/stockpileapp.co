import owaspPasswordStrengthTest from 'owasp-password-strength-test';

const stripe = Stripe('pk_test_vwzyWkXWLZkAiPQ7MrDn9Paw')
const elements = stripe.elements()

const createSubscription = (token) => {
  console.log(token)
  const body = {
    organization: {
      name: document.querySelector('#organization-name').value,
      email: document.querySelector('#organization-email').value,
      token: token.id
    },
    user: {
      firstName: document.querySelector('#first-name').value,
      lastName: document.querySelector('#last-name').value,
      email: document.querySelector('#user-email').value,
      password: document.querySelector('#password').value
    }
  }

  fetch('http://localhost:7862/subscription', {
    method: 'POST',
    body
  }).then((res) => {
    console.log(res)
  })
}

const style = {
  base: {
    lineHeight: '28px',
    fontWeight: 400,
    fontFamily: '"Assistant", Helvetica, sans-serif',
    fontSize: '16px',
    '::placeholder': {
      color: '#999'
    }
  }
}
const card = elements.create('card', { style })
card.mount('#card-element')

// Validation
card.addEventListener('change', ({ error }) => {
  const displayError = document.getElementById('card-errors');
  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
  }
})

// Form submission
const form = document.getElementById('payment-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();

  stripe.createToken(card)
    .then(({ token, error }) => {
      if (error) {
        // Inform the user if there was an error
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
      } else {
        // Send the token to your server
        createSubscription(token);
      }
    })
});

// Password validation
const checkPassword = (password) => {
  owaspPasswordStrengthTest.config({
    allowPassphrases: true,
    maxLength: 128,
    minLength: 10,
    minPhraseLength: 15,
    minOptionalTestsToPass: 4,
  })

  try {
    const result = owaspPasswordStrengthTest.test(password)
    return result.errors.join('<br>')
  } catch (err) {
    throw new Error('Could not check password strength.', err || '')
  }

  return ''
}

const passwordField = document.querySelector('#password')
const passwordError = document.querySelector('#password-error')
passwordField.addEventListener('blur', (event) => {
  passwordField.setCustomValidity(checkPassword(event.target.value))
  passwordError.innerHTML = event.target.validationMessage
})