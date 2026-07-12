document.addEventListener("DOMContentLoaded", () => {
  /*
    Open Quick View
  */

  document.querySelectorAll(".js-product-card").forEach((card) => {
    card.addEventListener("click", async () => {
      const handle = card.dataset.productHandle;

      console.log("product handle - ", handle);

      const response = await fetch(
        `/products/${handle}?section_id=quick-view-product`,
      );

      const html = await response.text();

      document.querySelector(".quick-view__content").innerHTML = html;

      document.getElementById("QuickViewModal").classList.add("is-active");
    });
  });

  /*
    Close Quick View
  */

  document.addEventListener("click", (event) => {
    const closeButton = event.target.closest(".quick-view__close");

    if (!closeButton) return;

    const modal = document.getElementById("QuickViewModal");

    modal.classList.remove("is-active");

    modal.querySelector(".quick-view__content").innerHTML = "";
  });

  /*
    Product option selection
    Handles:
    - Color buttons
    - Size custom select options
  */

  document.addEventListener("click", (event) => {
    const optionButton = event.target.closest(".js-product-option");

    if (!optionButton) return;

    const optionIndex = optionButton.dataset.optionIndex;

    /*
      Remove active state
      from same option group
    */

    document
      .querySelectorAll(
        `.js-product-option[data-option-index="${optionIndex}"]`,
      )
      .forEach((button) => {
        button.classList.remove("is-active");
      });

    /*
      Add active state
    */

    optionButton.classList.add("is-active");

    /*
      Handle custom select UI
    */

    const select = optionButton.closest(".js-select");

    if (select) {
      select.querySelector(".select-component__value").textContent =
        optionButton.dataset.value;

      select.classList.remove("is-open");
    }
  });

  /*
    Open / Close Custom Select
  */

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".js-select-trigger");

    if (trigger) {
      const select = trigger.closest(".js-select");

      select.classList.toggle("is-open");

      trigger.setAttribute(
        "aria-expanded",
        select.classList.contains("is-open"),
      );

      return;
    }

    /*
      Close dropdown if clicked outside
    */

    document.querySelectorAll(".js-select.is-open").forEach((select) => {
      select.classList.remove("is-open");
    });
  });

  /*
    Add To Cart
  */

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest(".quick-view-product-form");

    if (!form) return;

    event.preventDefault();

    const productContainer = form.closest(".quick-product");

    const productData = JSON.parse(
      productContainer.querySelector(".js-product-json").textContent,
    );

    /*
      Collect selected options
    */

    const selectedOptions = [];

    productContainer
      .querySelectorAll(".js-product-option.is-active")
      .forEach((option) => {
        selectedOptions[option.dataset.optionIndex] = option.dataset.value;
      });

    console.log("Selected options:", selectedOptions);

    /*
      Find matching variant
    */

    const selectedVariant = productData.variants.find((variant) => {
      return variant.options.every((option, index) => {
        return option === selectedOptions[index];
      });
    });
    console.log("productData.variants", productData.variants, selectedOptions);

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
      Gift with purchase
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
      Add items to cart
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
});
