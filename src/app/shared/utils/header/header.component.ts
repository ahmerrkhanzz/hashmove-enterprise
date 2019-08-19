import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoginDialogComponent } from '../../dialogues/login-dialog/login-dialog.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../../services/commonservice/data.service';
import { baseExternalAssets } from '../../../constants/base.url';
import { HashStorage, Tea, getImagePath, ImageSource, ImageRequiredSize } from '../../../constants/globalfunctions';
import { ConfirmLogoutDialogComponent } from '../../dialogues/confirm-logout-dialog/confirm-logout-dialog.component';
import { Router } from '@angular/router';
declare var $

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class HeaderComponent implements OnInit {

  public knowledgeMenu: boolean = false;
  public toolMenu: boolean = false;
  public isLoggedIn: boolean = false;
  public isAdmin: boolean;
  public userImagePath: string = '';
  public megaMenuType: string;
  public searchCriteria: any;
  public loginObj: any;
  public customerSettings:any;

  constructor(
    private modalService: NgbModal,
    private _dataService: DataService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.customerSettings = JSON.parse(HashStorage.getItem('customerSettings'))
    this.checkUserLogin()
    this.loginObj = JSON.parse(Tea.getItem('loginUser'));
    this.searchCriteria = JSON.parse(HashStorage.getItem("searchCriteria"));
    this._dataService.reloadHeader.subscribe(res => {
      if (res === true) {
        this.checkUserLogin()
      }
    })

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();



    // TODO: make this library agnostic
    // TODO: document the events
    (function ($) {
      function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
      var PLUGIN_NAME = 'slideMenu';
      var DEFAULT_OPTIONS = {
        position: 'right',
        showBackLink: true,
        keycodeOpen: null,
        keycodeClose: 27, //esc
        submenuLinkBefore: '',
        submenuLinkAfter: '',
        backLinkBefore: '',
        backLinkAfter: ''
      };

      var SlideMenu = function () {
        function SlideMenu(options) {
          _classCallCheck(this, SlideMenu);

          this.options = options;

          this._menu = options.elem;

          // Add wrapper
          this._menu.find('ul:first').wrap('<div class="slider">');

          this._anchors = this._menu.find('a');
          this._slider = this._menu.find('.slider:first');

          this._level = 0;
          this._isOpen = false;
          this._isAnimating = false;
          this._hasMenu = this._anchors.length > 0;
          this._lastAction = null;

          this._setupEventHandlers();
          this._setupMenu();

          if (this._hasMenu) this._setupSubmenus();
        }

        /**
         * Toggle the menu
         * @param {boolean|null} open
         * @param {boolean} animate
         */


        _createClass(SlideMenu, [{
          key: 'toggle',
          value: function toggle() {
            var open = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var offset = void 0;

            if (open === null) {
              if (this._isOpen) {
                this.close();
              } else {
                this.open();
              }
              return;
            } else if (open) {
              offset = 0;
              this._isOpen = true;
            } else {
              offset = this.options.position === 'left' ? '-100%' : '100%';
              this._isOpen = false;
            }

            this._triggerEvent();

            if (animate) this._triggerAnimation(this._menu, offset); else {
              this._pauseAnimations(this._triggerAnimation.bind(this, this._menu, offset));
              this._isAnimating = false;
            }
          }

          /**
           * Open the menu
           * @param {boolean} animate Use CSS transitions
           */

        }, {
          key: 'open',
          value: function open() {
            var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            this._lastAction = 'open';
            this.toggle(true, animate);
          }

          /**
           * Close the menu
           * @param {boolean} animate Use CSS transitions
           */

        }, {
          key: 'close',
          value: function close() {
            var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            this._lastAction = 'close';
            this.toggle(false, animate);
          }

          /**
           * Navigate one menu hierarchy back if possible
           */

        }, {
          key: 'back',
          value: function back() {
            this._lastAction = 'back';
            this._navigate(null, -1);
          }

          /**
           * Navigate to a specific link on any level (useful to open the correct hierarchy directly)
           * @param {string|object} target A string selector a plain DOM object or a jQuery instance
           */

        }, {
          key: 'navigateTo',
          value: function navigateTo(target) {
            // var _this = this;

            target = this._menu.find($(target)).first();

            if (!target.length) return false;

            var parents = target.parents('ul');
            var level = parents.length - 1;

            if (level === 0) return false;

            this._pauseAnimations(function () {
              this._level = level;
              parents.show().first().addClass('active');
              this._triggerAnimation(this._slider, -this._level * 100);
            });
          }

          /**
           * Set up all event handlers
           * @private
           */

        }, {
          key: '_setupEventHandlers',
          value: function _setupEventHandlers() {
            var _this2 = this;

            if (this._hasMenu) {
              this._anchors.click(function (event) {
                var anchor = $(event.target).is('a') ? $(event.target) : $(event.target).parents('a:first');
                _this2._navigate(anchor);
              });
            }

            $(this._menu.add(this._slider)).on('transitionend msTransitionEnd', function () {
              _this2._isAnimating = false;
              _this2._triggerEvent(true);
            });

            $(document).keydown(function (e) {
              switch (e.which) {
                case _this2.options.keycodeClose:
                  _this2.close();
                  break;

                case _this2.options.keycodeOpen:
                  _this2.open();
                  break;

                default:
                  return;
              }
              e.preventDefault();
            });

            this._menu.on('sm.back-after', function () {
              var lastActiveUl = 'ul ' + '.active '.repeat(_this2._level + 1);
              _this2._menu.find(lastActiveUl).removeClass('active').hide();
            });
          }

          /**
           * Trigger a custom event to support callbacks
           * @param {boolean} afterAnimation Mark this event as `before` or `after` callback
           * @private
           */

        }, {
          key: '_triggerEvent',
          value: function _triggerEvent() {
            var afterAnimation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var eventName = 'sm.' + this._lastAction;
            if (afterAnimation) eventName += '-after';
            this._menu.trigger(eventName);
          }

          /**
           * Navigate the _menu - that is slide it one step left or right
           * @param {jQuery} anchor The clicked anchor or button element
           * @param {int} dir Navigation direction: 1 = forward, 0 = backwards
           * @private
           */

        }, {
          key: '_navigate',
          value: function _navigate(anchor) {
            var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            // Abort if an animation is still running
            if (this._isAnimating) {
              return;
            }

            var offset = (this._level + dir) * -100;

            if (dir > 0) {
              if (!anchor.next('ul').length) return;

              anchor.next('ul').addClass('active').show();
            } else if (this._level === 0) {
              return;
            }

            this._lastAction = dir > 0 ? 'forward' : 'back';
            this._level = this._level + dir;

            this._triggerAnimation(this._slider, offset);
          }

          /**
           * Start the animation (the CSS transition)
           * @param elem
           * @param offset
           * @private
           */

        }, {
          key: '_triggerAnimation',
          value: function _triggerAnimation(elem, offset) {
            this._triggerEvent();

            if (!(String(offset).indexOf('%') !== -1)) offset += '%';

            elem.css('transform', 'translateX(' + offset + ')');
            this._isAnimating = true;
          }

          /**
           * Initialize the menu
           * @private
           */

        }, {
          key: '_setupMenu',
          value: function _setupMenu() {
            var _this3 = this;

            this._pauseAnimations(function () {
              switch (_this3.options.position) {
                case 'left':
                  _this3._menu.css({
                    left: 0,
                    right: 'auto',
                    transform: 'translateX(-100%)'
                  });
                  break;
                default:
                  _this3._menu.css({
                    left: 'auto',
                    right: 0
                  });
                  break;
              }
              _this3._menu.show();
            });
          }

          /**
           * Pause the CSS transitions, to apply CSS changes directly without an animation
           * @param work
           * @private
           */

        }, {
          key: '_pauseAnimations',
          value: function _pauseAnimations(work) {
            this._menu.addClass('no-transition');
            work();
            this._menu[0].offsetHeight; // trigger a reflow, flushing the CSS changes
            this._menu.removeClass('no-transition');
          }

          /**
           * Enhance the markup of menu items which contain a submenu
           * @private
           */

        }, {
          key: '_setupSubmenus',
          value: function _setupSubmenus() {
            var _this4 = this;

            this._anchors.each(function (i, anchor) {
              anchor = $(anchor);
              if (anchor.next('ul').length) {
                // prevent default behaviour (use link just to navigate)
                anchor.click(function (ev) {
                  ev.preventDefault();
                });

                // add `before` and `after` text
                var anchorTitle = anchor.text();
                anchor.html(_this4.options.submenuLinkBefore + anchorTitle + _this4.options.submenuLinkAfter);

                // add a back button
                if (_this4.options.showBackLink) {
                  var backLink = $('<a href class="slide-menu-control" data-action="back">' + anchorTitle + '</a>');
                  backLink.html(_this4.options.backLinkBefore + backLink.text() + _this4.options.backLinkAfter);
                  anchor.next('ul').prepend($('<li>').append(backLink));
                }
              }
            });
          }
        }], null);

        return SlideMenu;
      }();

      // adding class on click 
      $('.mobile-nav ').click(function () {
        $('body').toggleClass('mobile-nav-active')
      });

      // Link control buttons with the API


      $('body').on('click', '.slide-menu-control', function (e) {
        var menu = void 0;
        var target = $(this).data('target');

        if (!target || target === 'this') {
          menu = $(this).parents('.slide-menu:first');
        } else {
          menu = $('#' + target);
        }

        if (!menu.length) return;

        var instance = menu.data(PLUGIN_NAME);
        var action = $(this).data('action');

        if (instance && typeof instance[action] === 'function') {
          instance[action]();
        }

        return false;
      });

      // Register the jQuery plugin
      $.fn[PLUGIN_NAME] = function (options) {
        if (!$(this).length) {
          return;
        }

        options = $.extend({}, DEFAULT_OPTIONS, options);
        options.elem = $(this);

        var instance = new SlideMenu(options);
        $(this).data(PLUGIN_NAME, instance);

        return instance;
      };
    })(jQuery);

    var menuRight = $('#test-menu-right').slideMenu({
      submenuLinkAfter: ' <i class="fa fa-angle-right ml-2"></i>',
      backLinkBefore: '<i class="fa fa-angle-left mr-2"></i> '
    });
  }



  checkUserLogin() {
    if (HashStorage) {
      if (Tea.getItem('loginUser')) {
        let userData = JSON.parse(Tea.getItem('loginUser'))
        if (userData.IsLogedOut) {
          this.isLoggedIn = false
        } else {
          this.isLoggedIn = true;
          if (!userData.IsAdmin && userData.IsCorporateUser && userData.IsVerified) {
            this.isAdmin = true;
          } else {
            this.isAdmin = userData.IsAdmin;
          }
        }
        let userInfo = JSON.parse(Tea.getItem('loginUser'))
        this.userImagePath = userInfo.UserImage
        if (userInfo.UserImage) {
          // this.userImagePath = baseExternalAssets + "images/80x80/" + userInfo.UserImage
          this.userImagePath = baseExternalAssets + userInfo.UserImage.replace('large', 'x-small');
        }
      } else {
        this.isLoggedIn = false
      }
    }
  }

  toggleknowledgemenu() {
    this.toolMenu = false;
    this.knowledgeMenu = !this.knowledgeMenu;
  }
  toggletoolmenu() {
    this.toolMenu = !this.toolMenu;
    this.knowledgeMenu = false;
  }

  toggleMegamenu(val) {
    if (val === 'knowledge') {
      this.megaMenuType = 'knowledge-base'
    }
  }

  login() {
    const modalRef = this.modalService.open(LoginDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then((result) => {
      if (result) {
        this.loginObj = JSON.parse(Tea.getItem('loginUser'));
        this.searchCriteria = JSON.parse(HashStorage.getItem("searchCriteria"));
        if (this.searchCriteria && this.loginObj && !this.loginObj.IsLogedOut) {
          this.searchCriteria.customerID = this.loginObj.UserID;
          this.searchCriteria.loggedID = this.loginObj.UserID;
        }
        HashStorage.setItem("searchCriteria", JSON.stringify(this.searchCriteria));
      }
    })

    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  menuClose() {
    this.knowledgeMenu = false;
    this.toolMenu = false;
  }
  tonavigate(url) {
    this._router.navigate([url]);
  }

  onlogOut() {
    const modalRef = this.modalService.open(ConfirmLogoutDialogComponent, {
      size: 'sm',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    })
    modalRef.result.then((result) => {
      if (this.searchCriteria) {
        this.searchCriteria.customerID = null;
        this.searchCriteria.loggedID = null;
      }
      HashStorage.setItem("searchCriteria", JSON.stringify(this.searchCriteria));
    })
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  homeClick() {
    localStorage.removeItem('tempSearchCriteria')
    localStorage.removeItem('searchCriteria')
    this._router.navigate(['/home']);
  }

  getUIImage($image: string) {
    return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
  }
}
