document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display all products
    function loadProducts() {
      fetch('/api/admin/products')
        .then(res => res.json())
        .then(products => {
          const list = document.getElementById('product-list');
          list.innerHTML = '';
          products.forEach(product => {
            const item = document.createElement('li');
            item.innerHTML = `
              <strong>${product.title}</strong> - $${product.price} <br>
              ${product.description} <br>
              Category: ${product.category} | Qty: ${product.quantity}
              <br><img src="${product.image}" alt="${product.title}" width="100"><br>
              <button onclick='editProduct(${JSON.stringify(product)})'>Edit</button>
            `;
            list.appendChild(item);
          });
        });
    }
  
    // Submit form: create or update product
    document.getElementById('product-form').addEventListener('submit', e => {
      e.preventDefault();
      const id = document.getElementById('product-id').value;
  
      const product = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value,
        image: document.getElementById('image').value,
        quantity: parseInt(document.getElementById('quantity').value)
      };
  
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
  
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })
        .then(res => res.json())
        .then(() => {
          document.getElementById('product-form').reset();
          loadProducts();
        });
    });
  
    // Fill form to edit product
    window.editProduct = function(p) {
      document.getElementById('product-id').value = p.id;
      document.getElementById('title').value = p.title;
      document.getElementById('description').value = p.description;
      document.getElementById('price').value = p.price;
      document.getElementById('category').value = p.category;
      document.getElementById('image').value = p.image;
      document.getElementById('quantity').value = p.quantity;
    };
  
    // Bulk upload products
    document.getElementById('bulk-upload').addEventListener('click', () => {
      const raw = document.getElementById('bulk-json').value;
      try {
        const products = JSON.parse(raw);
        fetch('/api/admin/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(products)
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          loadProducts();
        });
      } catch (err) {
        alert('Invalid JSON');
      }
    });
  
    loadProducts();
  });
  