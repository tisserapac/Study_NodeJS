export class ProductsService {
    private products  = ['A book'];

    addProduct(productName: string){
        this.products.push(productName);
    }

    getProducts() {
        return [...this.products];
    }
}