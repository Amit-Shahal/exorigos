import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from 'src/app/services/Item';

/**
 * @title Injecting data when opening a dialog
 */

@Component({
  selector: 'dialog-box',
  templateUrl: 'dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {
  productForm!: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Item,
    private formBuilder: FormBuilder,
    public dialogRef: DialogRef<Item>
  ) {}

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      productName: ['', Validators.required],
      productDescription: [''],
      productPrice: ['', Validators.min(0)],
    });
  }

  addProduct() {
    if (
      this.isInputEmpty(
        this.productForm.value.productName,
        this.productForm.value.productPrice
      )
    ) {
      alert('fill required input');
      return;
    }
  }

  editProduct() {
    if (
      this.isInputEmpty(
        this.productForm.value.productName,
        this.productForm.value.productPrice
      )
    ) {
      alert('fill required input');
      return;
    }
  }

  isInputEmpty(productName: string, productPrice: number): boolean {
    return !productName || !productPrice;
  }
}
