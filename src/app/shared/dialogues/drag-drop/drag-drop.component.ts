import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit } from '@angular/core';
import { DataService } from '../../../services/commonservice/data.service';
import { DocumentFile } from '../../../interfaces/document.interface';

@Component({
  selector: 'app-drag-drop',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.scss']
})
export class DragDropComponent implements OnInit, AfterViewInit {


  public fileIsOver: boolean = false;
  public selectedFile: DocumentFile;
  public optionss = {
    readAs: 'DataURL'
  };

  @Input() allowedExtension: Array<string> = ['pdf', 'jpg', 'jpeg', 'xls', 'xlsx', 'doc', 'docx', 'png', 'txt']
  @Input() existingFile: string
  @Input() isSettings: boolean = false
  @Output() FileDropEvent: EventEmitter<DocumentFile> = new EventEmitter<DocumentFile>();
  @Output() InvalidFileEvent: EventEmitter<string> = new EventEmitter<string>();
  private maxSize: number = 10485760

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.selectedFile = {
      fileName: this.existingFile,
      fileBaseString: '',
      fileType: ''
    }
  }

  //File Drag Event$#1
  public fileOver(fileIsOver: boolean): void {
    this.fileIsOver = fileIsOver;
  }

  //File Drag Event$#1
  onFilesChange(file: File) {
    if (file) {

      if (file.size > this.maxSize) {
        this.InvalidFileEvent.emit('Unable to Upload Document , Document size should not exceed 10 MB')
        return
      }

      let newFile: DocumentFile = {
        fileName: file.name,
        fileType: '',
        fileBaseString: null
      }


      if (!file.name.includes('.')) {
        this.InvalidFileEvent.emit('Invalid File Selected')
        return;
      }


      const cpyfileName = file.name
      const fileExtension = cpyfileName.substring(cpyfileName.lastIndexOf('.') + 1, cpyfileName.length)
      this.allowedExtension.forEach((extension: string) => {
        if (fileExtension.toLowerCase().includes(extension.toLowerCase())) {
          newFile.fileType = extension
        }
      })
      this.selectedFile = newFile;
      this.existingFile = undefined
    }
  }

  //File Drag Event$#2
  onFileInvalids(invalidFile) {
    this.InvalidFileEvent.emit('Invalid File Selected')
  }

  //File Drag Event$#3
  public onFileDrop(file: any): void {
    if (this.selectedFile && this.selectedFile.fileName) {
      let baseFileData = file.split(',')[1];
      this.selectedFile.fileBaseString = baseFileData;
      this.selectedFile.whole = file
      this.FileDropEvent.emit(this.selectedFile);
    }
  }


  //Select File Event
  onFileChange(event) {
    let reader = new FileReader();

    if (event.target.files) {
      try {
        let file = event.target.files[0];
        reader.readAsDataURL(file);
        reader.onload = () => {

          if (file.size > this.maxSize) {
            this.InvalidFileEvent.emit('Unable to Upload Document , Document size should not exceed 10 MB')
            return
          }

          let selectedFile: DocumentFile = {
            fileName: file.name,
            fileType: '',
            fileBaseString: reader.result.toString().split(',')[1],
            whole: reader.result
          }

          let flag = false

          if (!file.name.includes('.')) {
            this.InvalidFileEvent.emit('Invalid File Selected')
            return;
          }

          const cpyfileName = file.name
          const fileExtension = cpyfileName.substring(cpyfileName.lastIndexOf('.') + 1, cpyfileName.length)
          this.allowedExtension.forEach((extension: string) => {
            if (fileExtension.toLowerCase().includes(extension.toLowerCase())) {
              selectedFile.fileType = extension
              flag = true;
            }
          })
          if (!flag) {
            this.InvalidFileEvent.emit('Invalid File Selected')
            return;
          }

          this.selectedFile = selectedFile;
          this.FileDropEvent.emit(this.selectedFile);
        };
      } catch (err) { }
    }
  }




}


