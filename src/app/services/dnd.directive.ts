import { Directive, HostListener, HostBinding, EventEmitter, Output, Input } from '@angular/core';

@Directive({
    selector: '[dragDropFile]'
})
export class DndDirective {
    @Input() private allowed_extensions: Array<string> = [];
    @Output() private filesChangeEmiter: EventEmitter<File> = new EventEmitter();
    @Output() private filesInvalidEmiter: EventEmitter<File> = new EventEmitter();
    @HostBinding('style.background') private background = '#eee';

    constructor() { }

    @HostListener('dragover', ['$event']) public onDragOver(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.background = '#999';
    }

    @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.background = '#eee'
    }

    @HostListener('drop', ['$event']) public onDrop(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        this.background = '#eee';
        let files = evt.dataTransfer.files;
        let valid_files: File
        let invalid_files: File
        if (files.length > 0) {
            let file = files[0]
            let ext = file.name.split('.')[file.name.split('.').length - 1];
            if (this.allowed_extensions.lastIndexOf(ext) != -1 && file.size < 10485760) { //20971520 is equal to 20mb
                valid_files = file
                this.filesChangeEmiter.emit(valid_files);
            }
            else {
                invalid_files = file
                this.filesInvalidEmiter.emit(invalid_files);
            }
        }
    }

}