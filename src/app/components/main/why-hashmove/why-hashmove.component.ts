import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-why-hashmove',
  templateUrl: './why-hashmove.component.html',
  styleUrls: ['./why-hashmove.component.scss']
})
export class WhyHashmoveComponent implements OnInit {

  constructor() { 
    
  }

  ngOnInit() {
  }



  hoverVideo() {
    var nowPlaying = "none";
    // var playersrc= $('#ytplayer').attr('src');

    // $('.hover-main').hover(function () {
    //   nowPlaying = $(this).find('iframe').attr('src');
    //   var parentDiv = $(this).parents('.we-do-section-right-side').addClass('grey-video');
    //   $(this).find('iframe').attr('src', nowPlaying + '&autoplay=1');
    // }, function () {
    //   $(this).find('iframe').attr('src', nowPlaying);
    // });


    // $('#ytplayer').mouseover(function () {
    //   var parentDiv = $(this).parents('.we-do-section-right-side').addClass('grey-video');
    //   $('#ytplayer').attr('src', playersrc + '&autoplay=1');
    // });
    // $('#ytplayer').mouseout(function () {
    //   $('#ytplayer').attr('src', playersrc);
    // });

    $('.hover-main').each(function (i, obj) {
      $(this).on("mouseover", function () {
        var parentDiv = $(this).parents('.about-image').addClass('hide');
        if ($(this).hasClass('muted')) {
          this.muted = true;
        }
        this.play();
      });
      $(this).on("mouseout", function () {
        var parentDiv = $(this).parents('.about-image').removeClass('hide');
        this.muted = false;
        this.pause();
      });
    });
  }
}
