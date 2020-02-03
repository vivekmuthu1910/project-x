import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FilesListComponent } from './components/files-list/files-list.component';

const routes: Routes = [
  {
    path: 'files',
    component: FilesListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilesRoutingModule {}
