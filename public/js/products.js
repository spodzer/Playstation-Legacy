// public/products.js

document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("product-list");
    const searchInput = document.getElementById("search");
  
    // Fetch and display all products initially
    fetchProducts();
  
    // Search functionality
    document.getElementById("search-button").addEventListener("click", () => {
      const searchTerm = searchInput.value.trim();
      fetchProducts(searchTerm);
    });
  
    function fetchProducts(search = "") {
      let url = "/api/products";
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
  
      fetch(url)
        .then(res => res.json())
        .then(products => {
          productList.innerHTML = "";
          if (products.length === 0) {
            productList.innerHTML = "<p>No games found.</p>";
            return;
          }
  
          products.forEach(product => {
            const div = document.createElement("div");
            div.className = "product";
  
            div.innerHTML = `
              <h3>${product.title}</h3>
              <p><strong>Genre:</strong> ${product.category}</p>
              <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
              <p><strong>Quantity:</strong> ${product.quantity}</p>
              <img src="${product.image}" alt="${product.title}" width="150">
              <button onclick="viewProduct(${product.id})">View Details</button>
            `;
  
            productList.appendChild(div);
          });
        })
        .catch(err => {
          console.error("Error fetching products:", err);
          productList.innerHTML = "<p>Failed to load games.</p>";
        });
    }
  });
  
  // Redirect to a single product page (optional enhancement)
  function viewProduct(id) {
    window.location.href = `/details.html?id=${id}`;
  }
  