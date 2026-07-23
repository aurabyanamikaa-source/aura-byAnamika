// Loads the Razorpay Checkout script once and caches the promise so repeat
// checkouts don't re-fetch it.
let razorpayScriptPromise = null;

export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        razorpayScriptPromise = null;
        reject(new Error('Failed to load Razorpay checkout script'));
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}