document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");
  
    fetch("/api/cart")
      .then(res => res.json())
      .then(items => {
        if (items.length === 0) {
          cartContainer.innerHTML = "<p>Your cart is empty.</p>";
          checkoutBtn.disabled = true;
          return;
        }
  
        let total = 0;
        items.forEach(item => {
          const itemTotal = item.price * item.quantity;
          total += itemTotal;
  
          const div = document.createElement("div");
          div.classList.add("cart-item");
  
          div.innerHTML = `
            <h3>${item.title}</h3>
            <p>Price: $${item.price.toFixed(2)}</p>
            <p>Quantity: ${item.quantity}</p>
            <p><strong>Subtotal:</strong> $${itemTotal.toFixed(2)}</p>
            <button onclick="removeItem(${item.id})">Remove</button>
            <hr>
          `;
  
          cartContainer.appendChild(div);
        });
  
        cartTotal.textContent = total.toFixed(2);
      })
      .catch(err => {
        console.error("Failed to load cart:", err);
        cartContainer.innerHTML = "<p>Error loading cart.</p>";
      });
  
    checkoutBtn.addEventListener("click", () => {
      fetch("/api/cart/checkout", {
        method: "POST"
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message || "Checkout complete!");
          location.reload();
        })
        .catch(err => {
          console.error("Checkout failed:", err);
          alert("Checkout failed. Please try again.");
        });
    });
  });
  
  function removeItem(id) {
    fetch(`/api/cart/${id}`, {
      method: "DELETE"
    })
      .then(() => location.reload())
      .catch(err => console.error("Failed to remove item:", err));
  }
  