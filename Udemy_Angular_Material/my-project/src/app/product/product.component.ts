import { Component, Input, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {
  @Input() productName: string;
  @Output() productClicked = new EventEmitter();

  constructor() {}

  onClicked(){
    this.productClicked.emit();

  }

}
