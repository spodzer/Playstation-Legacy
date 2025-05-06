document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
  
    if (!productId) {
      document.getElementById("product-title").textContent = "No product selected.";
      return;
    }
  
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(product => {
        if (product.error) {
          document.getElementById("product-title").textContent = "Product not found.";
          return;
        }
  
        document.getElementById("product-title").textContent = product.title;
        document.getElementById("product-description").textContent = product.description;
        document.getElementById("product-category").textContent = product.category;
        document.getElementById("product-price").textContent = product.price.toFixed(2);
        document.getElementById("product-image").src = product.image;
        document.getElementById("product-image").alt = product.title;
  
        document.getElementById("add-to-cart").addEventListener("click", () => {
            fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", 
                body: JSON.stringify({ product_id: product.id, quantity: 1 })
              })
              
          .then(res => res.json())
          .then(() => {
            document.getElementById("status-message").textContent = "Added to cart!";
          })
          .catch(err => {
            console.error("Add to cart failed:", err);
            document.getElementById("status-message").textContent = "Error adding to cart.";
          });
        });
      })
      .catch(err => {
        console.error("Fetch error:", err);
        document.getElementById("product-title").textContent = "Failed to load product.";
      });
  });
  