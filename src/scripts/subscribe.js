/* global Stripe */

import owaspPasswordStrengthTest from 'owasp-password-strength-test'

const stripe = Stripe('pk_live_3kEwvZb7NGvXEXop1q2b1sJI')
const elements = stripe.elements()

const subscribeButton = document.querySelector('#subscribe-button')
const formErrors = document.querySelector('#form-errors')

const handleResponse = (res) => {
  // Subscription created
  if (res.status === 201) {
    document.querySelector('section.subscribe').classList.toggle('hidden')
    document.querySelector('section.subscribed').classList.toggle('hidden')

    // Failed to create subscription
  } else {
    res.json().then((body) => {
      if (res.status < 500 && body) {
        formErrors.textContent = body.message
      } else {
        formErrors.textContent = 'Something went wrong. Please contact info@stockpileapp.co for help.'
        console.error(`Error: ${body.message}`)
      }
    })
  }

  subscribeButton.textContent = 'Subscribe'
}

const createSubscription = (token) => {
  const body = {
    token: token.id,
    organization: {
      name: document.querySelector('#organization-name').value,
      email: document.querySelector('#organization-email').value
    },
    user: {
      firstName: document.querySelector('#first-name').value,
      lastName: document.querySelector('#last-name').value,
      email: document.querySelector('#user-email').value,
      password: document.querySelector('#password').value
    }
  }

  fetch('/api/subscription', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(handleResponse)
}

// Stripe Elements
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
  const displayError = document.getElementById('card-errors')
  if (error) {
    displayError.textContent = error.message
  } else {
    displayError.textContent = ''
  }
})

// Form submission
const form = document.getElementById('payment-form')
form.addEventListener('submit', (event) => {
  event.preventDefault()

  subscribeButton.textContent = 'Loading...'
  formErrors.textContent = ''

  stripe.createToken(card)
    .then(({ token, error }) => {
      if (error) {
        const errorElement = document.getElementById('card-errors')
        errorElement.textContent = error.message
        subscribeButton.textContent = 'Subscribe'
      } else {
        createSubscription(token)
      }
    })
})

// Password validation
const checkPassword = (password) => {
  owaspPasswordStrengthTest.config({
    allowPassphrases: true,
    maxLength: 128,
    minLength: 10,
    minPhraseLength: 15,
    minOptionalTestsToPass: 4
  })

  try {
    const result = owaspPasswordStrengthTest.test(password)
    return result.errors.join('<br>')
  } catch (err) {
    throw new Error('Could not check password strength.', err || '')
  }
}

const passwordField = document.querySelector('#password')
const passwordError = document.querySelector('#password-error')
passwordField.addEventListener('blur', (event) => {
  passwordField.setCustomValidity(checkPassword(event.target.value))
  passwordError.innerHTML = event.target.validationMessage
})
