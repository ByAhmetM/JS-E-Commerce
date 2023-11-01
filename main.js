//!HTMLden gelenler

const categoryList = document.querySelector(".categories");
const productList = document.querySelector(".products");
const basketBtn = document.querySelector("#basket-btn");
const modal = document.querySelector(".modal-wrapper");
const closeBtn = document.querySelector("#close-btn");
const basketList = document.querySelector("#list");
const totalInfo = document.querySelector("#total");

//! Olay izleyicileri
//Html'in yüklenme anını izleyecek olay izleyicisi
document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
  fetchProducts();
});

// ! Kategori verilerini alma
//*1-Apiye istek at
//*2-Gelen veriyi işle
//*3-verileri ekrana basıcak fonksiyonu çalıştır.
//*4-Hata oluşursa kullanıcıyı bilgilendir.

const baseUrl = "https://fakestoreapi.com/products";

function fetchCategories() {
  fetch(`${baseUrl}/categories`)
    .then((response) => response.json())
    .then(renderCategories) //* then çalıştırdığı fonksiyona yukarıdan aldığı verileri parametre olarak gönderir
    .catch((err) => console.log("hata"));
}

//* Her bir kategori için ekrana kart oluştur

function renderCategories(categories) {
  categories.forEach((category) => {
    //*1-div oluştur.
    const categoryDiv = document.createElement("div");
    //*2-dive class ekle
    categoryDiv.classList.add("category");
    //*3-içeriğini belirleme
    const randomNum = Math.round(Math.random() * 100);
    categoryDiv.innerHTML = `
    <img src="https://picsum.photos/300/300?r=${randomNum}" />
    <h2>${category}</h2>
    `;
    //*4-Html'e gönderme
    categoryList.appendChild(categoryDiv);
  });
}

//! Data değişkenini global scopeda tanımladık
//! Bu sayede bütün fonksiyonlar bu değere erişebilecek
let data;
//? Ürünler verisini çeken fonksiyon

async function fetchProducts() {
  try {
    //*Apiye istek at
    const response = await fetch(`${baseUrl}`);
    //*Gelen cevabı işle
    data = await response.json();
    //*Ekrana bas
    renderProducts(data);
  } catch (error) {
    //alert("ürünleri alırken bir hata oluştu.");
    console.log(error);
  }
}

//? Ürünleri ekrana basacak fonksiyon
function renderProducts(products) {
  //* her bir ürün için ürün kartı oluşturma
  const cardsHTML = products
    .map(
      (product) => `<div class="card">
   <div class="img-wrapper"> <img src="${product.image}" /></div>
    <h4>${product.title}</h4>
    <h4>${product.category}</h4>
    <div class="info">
      <span>${product.price}₺</span>
      <button onclick="addToBasket(${product.id})">Sepete Ekle</button>
    </div>
  </div>`
    ) //!Join ile arrayi stringe çevirdik
    .join(" ");

  //? hazırladığımız html'i ekrana basma
  productList.innerHTML = cardsHTML;
}

//! Sepet işlemleri

let basket = [];
let total = 0;

//* Modalı açar
basketBtn.addEventListener("click", () => {
  modal.classList.add("active");
  renderBasket();
  calculateTotal();
});

//*Modalı kapatır çarpıya yada dışarıya tıklandığında
document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("modal-wrapper") ||
    e.target.id === "close-btn"
  ) {
    modal.classList.remove("active");
  }
});

//* Sepete ekleme
function addToBasket(id) {
  //* id'sinden yola çıkarak objenin değerlerini bulma (find method)
  const product = data.find((i) => i.id === id);
  //* Sepete ürün daha önce eklendiyse bulma
  const found = basket.find((i) => i.id == id);

  if (found) {
    //* miktarını arttır
    found.amount++;
  } else {
    //* seepete ürün ekler
    //? ... > spread operator(parçalar)
    //? bir objenin veya dizinin sahip olduğu değerleri
    //?farklı bir obje veya diziye aktarmaya yarar.
    basket.push({ ...product, amount: 1 });
    // ürünün bütün bilgilerini aldık yanına birde miktar ekledik.
  }
  //! Bildirim ver
  // https://apvarun.github.io/toastify-js/#
  Toastify({
    text: "Ürün Sepete Eklendi.",
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
}

//* Sepete elemanları listeleme
function renderBasket() {
  basketList.innerHTML = basket
    .map(
      (item) =>
        `<div class="item">
    <img src="${item.image}" />
    <h3 class="title">${item.title.slice(0, 20) + "..."}</h3>
    <h4 class="price">₺${item.price}</h4>
    <p>Miktar: ${item.amount}</p>
    <img onclick="handleDelete(${
      item.id
    })" id="delete-img" src="/images/e-trash.png" />
  </div>`
    )
    .join(" ");
}

// * toplam ürün sayı ve fiyatını hesaplar
function calculateTotal() {
  //* reduce > diziyi döner ve elemanların belirlediğimz değerlerini toplar
  const total = basket.reduce((sum, i) => sum + i.price * i.amount, 0);

  //toplam miktar hesaplama
  const amount = basket.reduce((sum, i) => sum + i.amount, 0);

  totalInfo.innerHTML = `
  <span id="count">${amount} ürün </span>
  toplam
  <span id="price"> ${total.toFixed(2)}</span>₺
  `;
}

//*elemanı siler

function handleDelete(deleteId) {
  //*kaldırılacak ürünü diziden çıkarma
  //!baskete güncelle basket dizisini filtrele ve içine deleteIdye eşit olmayanları koy. basketi yeniden oluştur
  basket = basket.filter((i) => i.id !== deleteId);

  //* Listeyi günceller
  renderBasket();
  //* toplamı günceller
  calculateTotal();
}
