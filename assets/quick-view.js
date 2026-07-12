/**
 * Quick View Product Handler
 * Manages the modal opening, closing, product options selection, and adding to cart with AJAX.
 */
document.addEventListener("DOMContentLoaded", () => {
  /**
   * Open Quick View Modal via Event Delegation
   * Listens for clicks on product cards, fetches the product details dynamically,
   * and opens the modal.
   */
  document.addEventListener("click", async (event) => {
    const card = event.target.closest(".js-product-card");
    if (!card) return;

    const handle = card.dataset.productHandle;
    if (!handle) return;

    // Prevent multiple requests while loading
    if (card.classList.contains("is-loading")) return;
    card.classList.add("is-loading");

    try {
      const response = await fetch(`/products/${handle}?section_id=quick-view-product`);
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }

      const html = await response.text();
      const modalContent = document.querySelector(".quick-view__content");
      const modal = document.getElementById("QuickViewModal");

      if (modalContent && modal) {
        modalContent.innerHTML = html;
        modal.classList.add("is-active");
      }
    } catch (error) {
      console.error("Error fetching quick view product data:", error);
    } finally {
      card.classList.remove("is-loading");
    }
  });

  /**
   * Close Quick View Modal
   * Closes the modal and resets the content.
   */
  document.addEventListener("click", (event) => {
    const closeButton = event.target.closest(".quick-view__close");
    if (!closeButton) return;

    const modal = document.getElementById("QuickViewModal");
    if (modal) {
      modal.classList.remove("is-active");
      const modalContent = modal.querySelector(".quick-view__content");
      if (modalContent) {
        modalContent.innerHTML = "";
      }
    }
  });

  /**
   * Product Option Selection
   * Handles clicking on color buttons and size custom select options.
   */
  document.addEventListener("click", (event) => {
    const optionButton = event.target.closest(".js-product-option");
    if (!optionButton) return;

    const optionIndex = optionButton.dataset.optionIndex;

    // Remove active state from all siblings in the same option group
    document
      .querySelectorAll(`.js-product-option[data-option-index="${optionIndex}"]`)
      .forEach((button) => {
        button.classList.remove("is-active");
      });

    // Add active state to clicked button
    optionButton.classList.add("is-active");

    // Sync custom dropdown select display if applicable
    const select = optionButton.closest(".js-select");
    if (select) {
      const selectValueLabel = select.querySelector(".select-component__value");
      if (selectValueLabel) {
        selectValueLabel.textContent = optionButton.dataset.value;
      }
      select.classList.remove("is-open");
    }
  });

  /**
   * Toggle Custom Dropdown Menu (Size Select)
   * Toggles dropdown and handles click-outside closing.
   */
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".js-select-trigger");

    if (trigger) {
      const select = trigger.closest(".js-select");
      if (select) {
        select.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", select.classList.contains("is-open"));
      }
      return;
    }

    // Close all open selects if clicked outside
    document.querySelectorAll(".js-select.is-open").forEach((select) => {
      select.classList.remove("is-open");
    });
  });

  /**
   * Add To Cart Form Submission (AJAX)
   * Finds matching variant based on selections and adds it to the cart.
   */
  document.addEventListener("submit", async (event) => {
    const form = event.target.closest(".quick-view-product-form");
    if (!form) return;

    event.preventDefault();

    const productContainer = form.closest(".quick-product");
    if (!productContainer) return;

    const productJsonEl = productContainer.querySelector(".js-product-json");
    if (!productJsonEl) return;

    try {
      const productData = JSON.parse(productJsonEl.textContent);
      const selectedOptions = [];

      // Collect currently active variant options
      productContainer
        .querySelectorAll(".js-product-option.is-active")
        .forEach((option) => {
          selectedOptions[option.dataset.optionIndex] = option.dataset.value;
        });

      // Find variant where every option value matches active selections
      const selectedVariant = productData.variants.find((variant) => {
        return variant.options.every((option, index) => {
          return option === selectedOptions[index];
        });
      });

      if (!selectedVariant) {
        alert("Selected option combination is currently unavailable.");
        return;
      }

      const items = [
        {
          id: selectedVariant.id,
          quantity: 1,
        },
      ];

      // Check for Gift with Purchase promotion (e.g. Black M size adds a gift)
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

      // Perform AJAX request to cart add endpoint
      const response = await fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error("Failed to add items to cart.");
      }

      // Success feedback (can trigger drawer open/redirect/toast alert here)
      alert(`${selectedVariant.title || "Product"} added to cart successfully!`);

      // Optionally close the modal after adding
      const modal = document.getElementById("QuickViewModal");
      if (modal) {
        modal.classList.remove("is-active");
        const modalContent = modal.querySelector(".quick-view__content");
        if (modalContent) {
          modalContent.innerHTML = "";
        }
      }
    } catch (err) {
      console.error("Cart AJAX error:", err);
      alert("Something went wrong while adding the product to your cart.");
    }
  });
});
