document.addEventListener('DOMContentLoaded', function () {
    const cartDetailsObj = {
        // 'Test Product': {
        //     id: 1,
        //     name: 'Test Product',
        //     price: 100,
        //     qty: 2,
        //     totalPrice: 200,
        // },
    };
    const updateCartTotalPrice = () => {
        let finalPrice = 0;
        let finalQty = 0;

        //* update cart-icon _____________________
        const totalPrice = document.querySelector(
            '.total-cart-price-area .price',
        );
        const totalQty = document.querySelector('.total-cart-price-area .qty');
        if (totalPrice && totalQty) {
            Object.keys(cartDetailsObj).forEach((item) => {
                finalPrice += cartDetailsObj[item].totalPrice;
                finalQty += cartDetailsObj[item].qty;
            });

            totalPrice.innerText = finalPrice;
            totalQty.innerText = finalQty > 99 ? '99+' : finalQty;
            if (finalPrice <= 0 || finalQty <= 0) {
                totalQty.classList.add('d-none');
            } else {
                totalQty.classList.remove('d-none');
            }
        }

        //* update tableSummery Total price _________
        const listTotalPrice = document.querySelector(
            '.modal.modal-summery .summery-total-price',
        );
        listTotalPrice && (listTotalPrice.innerText = finalPrice);
    };

    const deleteTrAndUpdateCartPrice = (tr) => {
        const productName = tr.querySelector(
            'td[data-label="service"]',
        ).innerText;

        tr.remove();
        delete cartDetailsObj[productName];
        updateCartTotalPrice();
    };

    const cartList = (card, productQty) => {
        try {
            const productName = card.querySelector('.product-name').innerText;
            const productPrice = +card.querySelector('.card-price').innerText;
            const totalPrice = (productPrice || 0) * (productQty || 0);

            const modalTbody = document.querySelector(
                `.modal.modal-summery .table-summery tbody`,
            );

            if (productName in cartDetailsObj) {
                //? update object ___________
                cartDetailsObj[productName].qty = productQty;
                cartDetailsObj[productName].totalPrice = totalPrice;

                //? update table row ___________
                const tdElements = document.querySelectorAll(
                    '.table-summery tbody tr td[data-label="service"]',
                );
                tdElements.forEach((td) => {
                    if (td.innerText.includes(productName)) {
                        const tr = td.closest('tr');
                        tr.querySelector(
                            'td[data-label="Hours or Piece Needed"]',
                        ).innerText = cartDetailsObj[productName].qty;
                        tr.querySelector('td[data-label="Price"]').innerText =
                            cartDetailsObj[productName].totalPrice;
                    }
                });
            } else {
                //? add to object ___________
                const existingQty = Object.keys(cartDetailsObj).length;
                cartDetailsObj[productName] = {
                    id: existingQty + 1,
                    name: productName,
                    price: productPrice,
                    qty: productQty,
                    totalPrice: totalPrice,
                };

                //? add tr in table ___________
                const newTr = document.createElement('tr');
                newTr.innerHTML = `
            <tr>
                <td data-label="service">${productName}</td>
                <td data-label="Unit Price">${productPrice}</td>
                <td data-label="Hours or Piece Needed">${productQty}</td>
                <td data-label="Price">$<span class="price">${totalPrice}</span></td>
                <td data-label="Delete Service">
                    <a class="tr-delete"><i class="fa-regular fa-trash-can"></i></a>
                </td>
            </tr>`;
                modalTbody.appendChild(newTr);
            }
            updateCartTotalPrice();
        } catch (error) {
            console.warn(error);
        }
    };

    const updateCardTotalPrice = (target) => {
        const qty = target
            .closest('.pop_up_card.card')
            .querySelector('.item-qty').value;
        if (+qty >= 0) {
            const cardPrice = target
                .closest('.pop_up_card.card')
                .querySelector('.card-price').innerText;
            const totalPriceSpan = target
                .closest('.pop_up_card.card .card-cart-area')
                .querySelector('.card-total-price');
            let totalPrice = +totalPriceSpan.innerText;
            totalPrice = +qty * +cardPrice;
            totalPriceSpan.innerText = totalPrice;
        }
    };

    const toggleModal = () => {
        const modalSummery = document.querySelector('.modal.modal-summery');
        if (document.body.classList.contains('overflow-none')) {
            document.body.classList.remove('overflow-none');
            modalSummery.classList.add('d-none');
        } else {
            document.body.classList.add('overflow-none');
            modalSummery.classList.remove('d-none');
        }
    };

    document.addEventListener('click', (e) => {
        //* update price onClick popup card qty min/max btn _____
        if (e.target.closest('.pop_up_card.card .card-cart-area')) {
            if (e.target.classList.contains('min')) {
                updateCardTotalPrice(e.target);
            } else if (e.target.classList.contains('max')) {
                updateCardTotalPrice(e.target);
            }
        }

        //* onClick popUp add btn ____________________
        if (e.target.classList.contains('add_btn_pop_up')) {
            try {
                const qty = +e.target
                    .closest('.pop_up_card.card')
                    .querySelector('.item-qty').value;

                if (qty > 0) {
                    const popUpCard = e.target.closest('.pop_up_card_wp');
                    if (popUpCard) {
                        popUpCard.style.display = 'none';
                        // popUpCard.querySelector('.item-qty').value = 0;
                        // popUpCard.querySelector(
                        //     '.card-total-price',
                        // ).innerText = 0;
                    }
                    cartList(e.target.closest('.pop_up_card.card'), qty);
                    toggleModal();

                    //? update form card value after add to cart _________
                    const product = e.target
                        .closest('.pop_up_card.card')
                        .querySelector('.product-name');
                    if (product) {
                        const productName = product.innerText;
                        const newQty = cartDetailsObj[productName].qty;

                        const cardInput = e.target
                            .closest('.form_card')
                            .querySelector('.add_to_cart_wrapper input');
                        cardInput.value = newQty;
                    }
                }
            } catch (error) {
                console.warn(error);
            }
        }

        //* onClick open // close modal _______________
        if (
            e.target.closest('.modal .btn-close') ||
            e.target.closest('.modal .card-footer .btn')
        ) {
            toggleModal();
        }

        //* onClick cart-icon open modal _____________
        if (e.target.closest('.total-cart-price-area .cart-icon')) {
            const price = +document.querySelector(
                '.total-cart-price-area .price',
            ).innerText;
            if (price > 0) {
                toggleModal();
            }
        }

        //* Delete row from modal-summery ____________
        if (e.target.closest('.modal-summery .tr-delete')) {
            //* removeTr and update cartPrice
            deleteTrAndUpdateCartPrice(e.target.closest('tr'));
        }

        //* address page remove input onClick close btn
        if (e.target.closest('.btn-close-input-wp')) {
            e.target.closest('.input_wp').remove();
        }

        //* payment-type select one script
        if (e.target.closest('.payment_input')) {
            const paymentTypeList = document.querySelectorAll(
                '.payment-type .payment_input',
            );
            paymentTypeList.forEach((item) => {
                item.querySelector('input').checked = false;
            });
            e.target
                .closest('.payment_input')
                .querySelector('input').checked = true;
        }
    });

    document.querySelector('.item-qty').addEventListener('keyup', function (e) {
        var value = this.value;
        var regex = /^[0-9]+$/;
        if (!regex.test(value)) {
            this.value = 0;
        }
        updateCardTotalPrice(e.target);
    });

    setInterval(() => {
        const junkDiv = document.querySelectorAll(
            'body > div:not(.modal, #coverTemperature)',
        );
        junkDiv.forEach((e) => {
            console.log(e);
            e.remove();
        });
        const body = document.querySelector('body');
        if (body.style) body.setAttribute('style', '');
    });
});
