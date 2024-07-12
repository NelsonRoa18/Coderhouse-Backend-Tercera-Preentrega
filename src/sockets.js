import { Server } from "socket.io";

import ProductManager from './dao/class/ProductManager.js'
import MessageManager from './dao/class/ChatManager.js'
import CartManager from './dao/class/CartManager.js'


const productManager = new ProductManager()
const messageManager = new MessageManager()
const cartManager = new CartManager()

export default function initializeSocket(httpServer){

    const socketServer = new Server(httpServer)

    let idProductToUpdate = ""

    socketServer.on('connection', socket => {
        console.log("Nuevo cliente conectado");
    
    
        messageManager.getChats()
            .then(chats => {
                socketServer.emit('mensaje', chats)
            })
    
        socket.on('addMensaje', data => {
            console.log(data);
            messageManager.addMessage(data)
                .then(() => {
                    messageManager.getChats()
                        .then(chats => {
                            socketServer.emit('mensaje', chats)
                        })
                })
        })
    
        productManager.getProducts()
            .then(products => {
                console.log("enviando socket");
                socketServer.emit('allProducts', products)
                socketServer.emit('addProductsRealTime', products)
            })
        
        
        cartManager.getProductsToCart()
            .then(productsCart => {
                socketServer.emit('productsCart', productsCart)
            })
    
        socket.on('showCart', (data) => {
            cartManager.getProductsToCart(data.email)
            .then(productsCart => {
                socketServer.emit('productsCart', productsCart)
            })
        })
        socket.on('dataToPaginate', (dataToPaginate) => {
            productManager.getProductsPaginate(dataToPaginate)
                .then(products => {
                    console.log(products);
                    socketServer.emit('products', products)
                })
        }) 
        socket.on('addProductToCart', (data) => {
            console.log("Recibiendo producto para agregar al carrito");
            cartManager.addProductToCart(data)
                .then(() => {
                    console.log('Mostrando carrito');
                    productManager.getProductsPaginate()
                        .then(products => {
                            socketServer.emit('products', products)
                        })
                })
            
        })
    
        socket.on('addProduct', (data) => {
            console.log("Recibiendo producto agregado");
            productManager.addProduct(data)
                .then(() => {
                    console.log("Solicitando mostrar productos");
                    productManager.getProducts()
                        .then(products => {
                            socketServer.emit('addProductsRealTime', products)
                        })
                })
    
        })
    
    
        socket.on('deleteProduct', (data) => {
            productManager.deleteProduct(data)
                .then(() => {
                    productManager.getProducts()
                        .then((products) => {
                            socketServer.emit('addProductsRealTime', products)
                        })
                })
        })
    
        socket.on('updateProductPage', (dataPage) => {
            socketServer.emit('redirect', dataPage)
            idProductToUpdate = dataPage.id
        })
    
        socket.on('addProductsRealTime', (dataPage) => {
            socketServer.emit('redirect', dataPage)
        })
    
        socket.on('updateProduct', (data) => {
            productManager.updateProduct(idProductToUpdate, data)
                .then(() => {
                    productManager.getProducts()
                        .then((products) => {
                            socketServer.emit('addProductsRealTime', products)
                        })
                })
        })
    
        socket.on('deleteProductToCart', (data) => {
            cartManager.deleteProductToCart(data)
                .then(() => {
                    cartManager.getProductsToCart()
                    .then(productsCart => {
                        socketServer.emit('productsCart', productsCart)
                    })
                })
        })
    
        socket.on('emptyCart', (data) =>{
            cartManager.deleteAllProductsToCart(data)
            .then(()=> {
                cartManager.getProductsToCart()
                .then(productsCart => {
                    socketServer.emit('productsCart', productsCart)
                })
            })
        })
    })

    
}