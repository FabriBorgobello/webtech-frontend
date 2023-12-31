document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalPriceElement = document.getElementById("total-price");

  // Get cart data from localStorage or your API endpoint.
  const cart = getCartData();

  if (cart.length === 0) {
    showEmptyCartMessage();
  } else {
    // Render cart items
    renderCartItems(cart, cartItemsContainer);

    // Calculate and display the total
    const total = calculateTotal(cart);
    totalPriceElement.textContent = `$${total.toFixed(2)}`;

    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn.addEventListener("click", goToStripe);
  }
});

function getCartData() {
  // Replace this with your logic to retrieve cart data.
  const cartData = JSON.parse(localStorage.getItem("cart")) || [];
  return cartData;
}

function renderCartItems(cart, container) {
  container.innerHTML = ""; // Clear the container first.

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    cartItem.innerHTML = `
            <div class="cart-item-details">
                <h2>${item.name}</h2>
                <p>Price: $${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <button class="remove-from-cart-btn">Remove</button>
        `;

    const removeButton = cartItem.querySelector(".remove-from-cart-btn");
    removeButton.addEventListener("click", () => {
      removeFromCart(item);
    });

    container.appendChild(cartItem);
  });
}

function removeFromCart(item) {
  // Get the current cart data from localStorage
  const cart = getCartData();

  // Find the index of the item to be removed in the cart
  const itemIndex = cart.findIndex((cartItem) => cartItem.id === item.id);

  if (itemIndex !== -1) {
    // Remove the item from the cart array
    cart.splice(itemIndex, 1);

    // Update the cart data in localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Re-render the cart items on the page
    const cartItemsContainer = document.getElementById("cart-items");
    renderCartItems(cart, cartItemsContainer);

    // Calculate and update the total
    const totalPriceElement = document.getElementById("total-price");
    const total = calculateTotal(cart);
    totalPriceElement.textContent = `$${total.toFixed(2)}`;

    if (cart.length === 0) {
      showEmptyCartMessage();
    }

    // Optional: Display a confirmation message
    alert(`Removed ${item.name} from the cart`);
  } else {
    alert("Item not found in the cart.");
  }
}

function calculateTotal(cart) {
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.quantity;
  });
  return total;
}

function showEmptyCartMessage() {
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
  document.querySelector(".checkout-container").style.display = "none";
}

async function goToStripe() {
  // Get products from localstorage.
  const cart = getCartData();

  const body = cart.map((product) => {
    return {
      price: product.stripe_price_id,
      quantity: product.quantity,
    };
  });

  // Connect with payment service.
  console.log("Connecting with Payment Servicet...");
  fetch("http://localhost:4242/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => {
      window.location.href = data.url;
    });
}
