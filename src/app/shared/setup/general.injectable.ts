import { Injectable, Provider } from '@angular/core';
import { SearchCriteria } from '../../interfaces/searchCriteria';
import { HashStorage } from '../../constants/globalfunctions';
import { ShareshippingComponent } from '../dialogues/shareshipping/shareshipping.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class GeneralService {

    isOpen = false

    constructor(
        private _modalService: NgbModal,
    ) { }

    shareLclShippingAction($htmlElement, $searchCriteria: SearchCriteria, $provider) {
        if (!$htmlElement && !$searchCriteria && $provider) {
            const modalRef2 = this._modalService.open(ShareshippingComponent, {
                size: 'lg',
                centered: true,
                windowClass: 'small-modal',
                backdrop: 'static',
                keyboard: false
            })
            modalRef2.componentInstance.shareObjectInfo = {
                provider: $provider,
            }
        } else {
            const ContainerLoadType: string = $searchCriteria.containerLoad
            const ShippingMode: string = $searchCriteria.TransportMode

            const { searchMode } = $searchCriteria

            let lclPriceDetails = ''
            if (searchMode === 'sea-lcl') {
                if ($htmlElement) {
                    lclPriceDetails = document.getElementById($htmlElement).innerHTML.toString().trim().toString()
                }
            }


            let selectedCarrier = null
            if (searchMode === 'air-lcl') {
                selectedCarrier = JSON.parse(HashStorage.getItem('selectedCarrier'))
            }
            // this.isOpen = true

            const modalRef = this._modalService.open(ShareshippingComponent, {
                size: 'lg',
                centered: true,
                windowClass: 'small-modal',
                backdrop: 'static',
                keyboard: false
            })
            modalRef.componentInstance.shareObjectInfo = {
                lclPriceDetails,
                carrier: (selectedCarrier) ? selectedCarrier : {}, provider: $provider,
                ContainerLoadType: ContainerLoadType,
                ShippingMode: ShippingMode,
            }
            setTimeout(() => {
                if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
                    document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
                }
            }, 0);
        }
    }

}

