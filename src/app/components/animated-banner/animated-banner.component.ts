import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TweenMax, Power2, TimelineLite, TweenLite, TimelineMax, SlowMo, Linear } from "gsap/all";
import { getImagePath, ImageSource, ImageRequiredSize, HashStorage } from '../../constants/globalfunctions';

@Component({
  selector: 'app-animated-banner',
  templateUrl: './animated-banner.component.html',
  styleUrls: ['./animated-banner.component.scss']
})
export class AnimatedBannerComponent implements OnInit, AfterViewInit {
  public customerSettings:any = {}
  constructor() { }

  ngOnInit() {
    this.customerSettings = JSON.parse(HashStorage.getItem('customerSettings'))
  }

  ngAfterViewInit() {
    // this.animation();
  }

  getUIImage($image: string) {
    return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
  }

  animation() {
    const width = document.getElementById('bannerbg').clientWidth;
    const height = document.getElementById('bannerbg').clientHeight;

    TweenMax.to(document.getElementById("plane"), 10, {
      bezier: [{
        x: 0,
        y: 0
      }, {
        x: -1 * (width / 2),
        y: -1 * (height * .25)
      }, {
        x: -1 * (width + 200),
        y: -1 * (height * .60)
      }],
      ease: SlowMo.ease.config(0.1, 0.1, false),
      repeat: -1,
      repeatDelay: 12
    });
    const truck = document.getElementById("truck");
    TweenMax.to(truck, 14, {
      left: (width + 200) + "px",
      repeat: -1,
      yoyo: true,
      repeatDelay: 8,
      ease: Linear.easeNone,
      onRepeat: flipTruck
    });

    function flipTruck() {
      TweenLite.set(truck, {
        rotationY: '+=180'
      });
    }

    const clouds = document.getElementById("clouds");
    TweenMax.to(clouds, 55, {
      left: (width + 248) + "px",
      repeat: -1,
      repeatDelay: 5,
      ease: Linear.easeNone,
    });
    const smallcloud = document.getElementById("smallcloud");
    TweenMax.to(smallcloud, 60, {
      left: (width + 248) + "px",
      repeat: -1,
      repeatDelay: 5,
      ease: Linear.easeNone,
      delay: 15
    });
    const bigcloud = document.getElementById("bigcloud");
    TweenMax.to(bigcloud, 65, {
      left: (width + 248) + "px",
      repeat: -1,
      repeatDelay: 5,
      ease: Linear.easeNone,
      delay: 30
    });
    //adding animation to shipdock svg
    const shippingDoc = document.getElementById("dock") as HTMLObjectElement;
    shippingDoc.addEventListener("load", function () {
      const doc = this.getSVGDocument();
      const crane = doc.getElementById("craneMovementHorizontal");
      const pulley = doc.getElementById("craneMovementVertical");
      const craneTween = TweenMax.to(crane, 10, {
        x: "150",
        repeat: -1,
        yoyo: true,
        ease: Linear.easeNone,
        onRepeat: activatePulley
      });

      function activatePulley() {
        craneTween.pause();
        TweenMax.to(pulley, 3, {
          y: "18",
          yoyo: true,
          repeat: 1,
          repeatDelay: 1,
          ease: Linear.easeNone,
          onComplete: activateCrane
        });
      }
      function activateCrane() {
        craneTween.resume();
      }
    });

    //adding animation to waves svg
    const waterWaves = document.getElementById("waves") as HTMLObjectElement;
    waterWaves.addEventListener("load", function () {
      const doc = this.getSVGDocument();
      const firstwave = doc.getElementById("firstwave");
      const secondwave = doc.getElementById("secondwave");
      const thirdwave = doc.getElementById("thirdwave");
      addWave(7, firstwave, true);
      addWave(6, secondwave, true);
      addWave(5, thirdwave, true);

      function addWave(time, element, alternate) {
        const tlite = new TimelineMax({
          repeat: -1,
          yoyo: true,
          ease: Power2.easeIn
        });
        if (alternate !== undefined) {
          tlite.from(element, (time * 0), {
            x: -10,
            y: 0
          })
            .to(element, (time * .50), {
              x: 10,
              y: -8
            })
            .to(element, (time * .50), {
              x: -10,
              y: 0
            });
        } else {
          tlite.from(element, (time * 0), {
            x: 10,
            y: -10
          })
            .to(element, (time * .50), {
              x: -10,
              y: 0
            })
            .to(element, (time * .50), {
              x: 10,
              y: -10
            });
        }
        return tlite;
      }
    });
  }

}

