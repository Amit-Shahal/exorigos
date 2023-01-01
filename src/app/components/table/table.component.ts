import { Item } from './../../services/Item';
import { ItemService } from './../../services/item.service';
import { MatTableDataSource } from '@angular/material/table';

import { Component } from '@angular/core';
//
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
//
import { HttpClient } from '@angular/common/http';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements AfterViewInit {
  items!: MatTableDataSource<Item>;
  displayedColumns: string[] = ['id', 'name', 'description', 'price', 'edit'];
  exampleDatabase!: ItemService | null;

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  constructor(private _itemService: HttpClient, public dialog: MatDialog) {}

  ngAfterViewInit() {
    this.exampleDatabase = new ItemService(this._itemService);
    // If the user changes the sort order, reset back to the first page.
    this.sort?.sortChange.subscribe(() => (this.paginator!.pageIndex = 0));

    merge(this.sort!.sortChange, this.paginator!.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getItems().pipe(
            catchError(() => observableOf(null))
          );
        }),
        map((data) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          // Only refresh the result length if there is new data. In case of rate
          // limit errors, we do not want to reset the paginator to zero, as that
          // would prevent users from re-triggering requests.
          this.resultsLength = data.length;
          return data;
        })
      )
      .subscribe((data) => {
        this.items = new MatTableDataSource(data);
        this.items.paginator = this.paginator || null;
        this.items.sort = this.sort || null;
        //filter only name and description
        this.items.filterPredicate = ((data: Item, filter) => {
          const a = !filter || data.name?.trim().toLowerCase().includes(filter);
          const b =
            !filter || data.description?.trim().toLowerCase().includes(filter);

          return a || b;
        }) as (arg0: Item, arg1: string) => boolean;
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.items.filter = filterValue.trim().toLowerCase();
    if (this.items.paginator) {
      this.items.paginator.firstPage();
    }
  }
  openEditDialog(row: Item) {
    this.dialog
      .open(DialogComponent, {
        height: '420px',
        width: '600px',
        data: {
          ...row,
        },
      })
      .afterClosed()
      .subscribe({
        next: (res) => {
          let data = this.items.data;
          data.forEach((item) => {
            if (item.id === res.data.id) {
              item.name = res.form.productName;
              item.description = res.form.productDescription;
              item.price = res.form.productPrice;
              return;
            }
          });
        },
        error: () => {
          alert('something went wrong');
        },
      });
  }

  openAddDialog() {
    this.dialog
      .open(DialogComponent, {
        height: '420px',
        width: '600px',
      })
      .afterClosed()
      .subscribe({
        next: (res) => {
          const item: Item = {
            id: this.items.data.length,
            name: res.form.productName,
            description: res.form.productDescription,
            price: res.form.productPrice,
          };
          let data = this.items.data;
          this.items.data = [item, ...data];
        },
        error: () => {
          alert('something went wrong');
        },
      });
  }
}
