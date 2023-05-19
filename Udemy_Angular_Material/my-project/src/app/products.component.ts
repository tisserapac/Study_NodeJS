import { Component } from "@angular/core";

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html'
})

export class ProductsComponent {
    productName = 'A book';
    isDisabled = true;
    products = ['A book', 'A tree'];

    constructor() {
        setTimeout(() => {
          // this.productName = 'A Tree';
          this.isDisabled = false;
        }, 3000);
    }

    onAddProduct(){
        this.products.push(this.productName)
    }

    onRemoveProduct(productName: string){
        this.products = this.products.filter(p => p !== productName )

    }
}