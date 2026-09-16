const modalContainer = document.getElementById("modal-container");
const modalOverlay = document.getElementById("modal-overlay");

const cartBtn = document.getElementById("cart-btn");

const displayCart = () => {
  modalContainer.innerHTML = "";
  modalContainer.style.display = "block";
  modalOverlay.style.display = "block";

  //modal header
  const modalHeader = document.createElement("div");

  const modalClose = document.createElement("div");
  modalClose.innerText = "❌";
  modalClose.className = "modal-close";
  modalHeader.append(modalClose);

  modalClose.addEventListener("click", () => {
    modalContainer.style.display = "none";
    modalOverlay.style.display = "none";
  });

  const modalTitle = document.createElement("div");
  modalTitle.innerText = "Cart";
  modalTitle.className = "modal-title";
  modalHeader.append(modalTitle);

  modalContainer.append(modalHeader);

  //modal Body
  cart.forEach((product) => {
    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";
    modalBody.innerHTML = `
    <div class="product">
            <img class-"product-img" src="${product.img}" />
            <div class="product-info">
                <h4>${product.productName}</h4>
            </div>
        <div class="quanty">
            <span class="quanty-btn-decrease">-</span>
            <span class="quanty-input">${product.quanty}</span>
            <span class="quanty-btn-increase">+</span>
        </div>
            <div class="price">${product.price * product.quanty} $</div>
            <div class="delete-product">❌</div>
    </div>
        `;
    modalContainer.append(modalBody);

    const decrease = modalBody.querySelector(".quanty-btn-decrease");
    decrease.addEventListener("click", () => {
      if (product.quanty !== 1) {
        product.quanty--;
        displayCart();
      }
    });

    //Borrar elementos del carro
    const deleteProduct = modalBody.querySelector(".delete-product");
    deleteProduct.addEventListener("click", () => {
      deleteCartProduct(product.id);
    });

    const increase = modalBody.querySelector(".quanty-btn-increase");
    increase.addEventListener("click", () => {
      product.quanty++;
      displayCart();
    });
  });

  //modal Footer
  const total = cart.reduce((acc, el) => acc + el.price * el.quanty, 0);

  const modalFooter = document.createElement("div");
  modalFooter.className = "modal-footer";
  modalFooter.innerHTML = `
<div class ="total-price">Total: ${total} $</div>
`;
  modalContainer.append(modalFooter);
};

cartBtn.addEventListener("click", displayCart);

//Borrar elementos del carro
const deleteCartProduct = (id) => {
  const foundId = cart.findIndex((element) => element.id === id);
  cart.splice(foundId, 1);
  displayCart();
}
