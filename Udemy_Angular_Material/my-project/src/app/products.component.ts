import { Component } from "@angular/core";
import { from } from "rxjs";

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

    onAddProduct(form){        
        if(form.valid){
            this.products.push(form.value.productName)
        }
    }

    onRemoveProduct(productName: string){
        this.products = this.products.filter(p => p !== productName )

    }
}