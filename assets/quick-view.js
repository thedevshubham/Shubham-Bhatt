document.querySelectorAll(".js-product-card").forEach((card) => {
  card.addEventListener("click", async () => {
    const handle = card.dataset.productHandle;
    console.log(" test - ", handle);

    const response = await fetch(
      `/products/${handle}?section_id=quick-view-product`,
    );

    const html = await response.text();

    document.querySelector(".quick-view__content").innerHTML = html;
    document.getElementById("QuickViewModal").classList.add("is-active");
  });
});

const quickViewModal = document.getElementById("QuickViewModal");

const closeQuickView = () => {
  quickViewModal.classList.remove("is-active");

  // optional cleanup
  quickViewModal.querySelector(".quick-view__content").innerHTML = "";
};

// Close button
document
  .querySelector(".quick-view__close")
  .addEventListener("click", closeQuickView);

// // Overlay click
// document
//   .querySelector(".quick-view__overlay")
//   .addEventListener("click", closeQuickView);

// Add to cart
document.addEventListener("submit", async (event) => {
  const form = event.target.closest(".quick-view-product-form");

  if (!form) return;

  event.preventDefault();

  const productContainer = form.closest(".quick-product");

  const productData = JSON.parse(
    productContainer.querySelector(".js-product-json").textContent,
  );

  /*
    Get selected options
  */

  const selectedOptions = [];

  productContainer.querySelectorAll(".js-product-option").forEach((select) => {
    selectedOptions.push(select.value);
  });

  console.log("Selected options:", selectedOptions);

  /*
    Find matching variant
  */
  const selectedVariant = productData.variants.find((variant) => {
    return variant.options.every(
      (option, index) => option === selectedOptions[index],
    );
  });

  if (!selectedVariant) {
    console.log("Variant not found");

    return;
  }

  console.log("Selected variant ID:", selectedVariant.id);

  const items = [
    {
      id: selectedVariant.id,
      quantity: 1,
    },
  ];

  /*
    Gift with purchase check
  */

  const colorIndex = productData.options.indexOf("Color");

  const sizeIndex = productData.options.indexOf("Size");

  const color = selectedVariant.options[colorIndex];

  const size = selectedVariant.options[sizeIndex];

  const shouldAddGift = color === "Black" && size === "M";

  if (shouldAddGift && window.ShopifyConfig.giftWithPurchaseVariant) {
    items.push({
      id: window.ShopifyConfig.giftWithPurchaseVariant,

      quantity: 1,
    });
  }

  /*
    Add to cart
  */

  await fetch("/cart/add.js", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      items,
    }),
  });
});
