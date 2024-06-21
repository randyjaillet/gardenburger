window.gardenburgers=[];class Gardenburger{i;$n;$b;constructor(e,t){"string"==typeof(t=t||{})&&(t=$.parseJSON(t)),this.settings=$.extend({breakpoint:600},t);let i=-1;if($.each(window.gardenburgers,((e,t)=>{t&&t.is(this)&&(i=$.inArray(t,window.gardenburgers))})),i>=0)window.gardenburgers[i].destroy(!0),window.gardenburgers[i]=this;else{const e=window.gardenburgers.findIndex((e=>void 0===e));e>=0?window.gardenburgers[e]=this:window.gardenburgers.push(this)}this.i=$(window.gardenburgers).index(this),this.$n=e,this.$b=$(e.data("gardenburger"));const n=this,r=this.$n.find("ul").first().children("li"),s=r.find("li"),o=s.not("li li li"),a=r.children("a, .nav-item"),d=s.children("a, .nav-item"),h=r.has("ul, .nav-dropdown"),l=s.has("ul, .nav-dropdown"),c=$('<svg class="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'),f=$('<svg class="icon-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'),g=$('<label class="icon-chevron-compact-label">'),p=$('<input type="checkbox"/>'),w=$('<svg class="icon-chevron-compact" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'),u=$('<svg class="icon-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4488bb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>');a.add(d).prepend(c),g.append(p,w).appendTo(h.add(l).children("a, .nav-item")),h.children("a, .nav-item").after(f),l.children("a, .nav-item").after(u),this.$n.find(".nav-item:not(a)").attr("tabIndex","-1"),this.$b.on("click",(function(e){e.preventDefault(),n.$n.toggleClass("revealed")})),this.$n.filter(".compact").find(".icon-chevron-compact-label > [type=checkbox]").on("keydown",(e=>{13==e.which&&(e.preventDefault(),$(e.target).trigger("click"))})),this.$n.on("keydown",(e=>{if($(e.target).is("a, .nav-item")&&n.$n.is(":not(.compact)")){const t=$(e.target),i=this.$n.find("ul, .nav-dropdown"),n=this.$n.find("li"),a=this.$n.find("a, .nav-item"),d=t.parents(n).first(),h=d.nextAll(n).has(a).first(),l=d.prevAll(n).has(a).first(),c=d.parent("ul").parents(n).has(a).first(),f=d.find(i).first(),g=d.parent("ul").parents(n).has(a).not(s).first().next(n),p=d.parent("ul").parents(n).has(a).not(s).first().prev(n),w=d.is(r),u=d.is(o),v=d.closest(i).is(".flip-h"),b=d.find(i).first().is(".flip-h");let m,k,x,C;switch(e.which){case 27:e.preventDefault(),$(e.target).trigger("blur");break;case 37:w?m=l:f.length&&b?m=f:u?m=p:v||(m=c),Gardenburger.#e(m);break;case 38:l.length?k=l:u&&(k=c),Gardenburger.#e(k);break;case 39:w?x=h:f.length&&!b?x=f:u?x=g:v&&(x=c),Gardenburger.#e(x);break;case 40:C=w?f:h,Gardenburger.#e(C)}}})),this.#t(),this.#i(),$(window).on("resize",(()=>{n.#t(),n.#i()}))}#i(){$(window).width()>this.settings.breakpoint?this.#n():this.#r()}#r(){this.$b.filter(":hidden").show(),this.$n.filter(":not(.compact)").addClass("compact")}#n(){this.$b.filter(":visible").hide(),this.$n.filter(".compact").removeClass("compact"),this.$n.filter(".revealed").removeClass("revealed"),this.$n.find(".icon-chevron-compact-label > input:checked").prop("checked",!1)}static#e(e){return void 0!==e&&e.length&&(e.is("a, .nav-item")?e.trigger("focus"):e.find("a, .nav-item").first().trigger("focus")),e}#t(){const e=this;this.$n.children("ul").find("ul, .nav-dropdown").not("li li *").each((function(){const e=$(this).outerWidth()+$(this).parent().offset().left>$(window).width(),t=$(this).parent().offset().left>$(this).outerWidth(),i=$(this).outerHeight()+$(this).parent().offset().top>$(window).height(),n=$(this).parent().offset().top>$(this).outerWidth();e&&t&&$(this).addClass("justify-right"),i&&n&&$(this).addClass("flip-v")})),this.$n.children("ul").find("ul, .nav-dropdown").find("ul, .nav-dropdown").each((function(){const t=e.$n.find("li").has(this).not(".gardenburger li li"),i=t.find("ul, .nav-dropdown").first().hasClass("justify-right");let n=$(this).outerWidth()+t.offset().left+t.outerWidth(),r=e.$n.find("ul, .nav-dropdown").has(this).filter(".gardenburger li *");i&&(r=e.$n.find("ul, .nav-dropdown").has(this).filter(".gardenburger li li *")),r.each(((e,t)=>{n+=$(t).outerWidth()})),n>$(window).width()&&$(this).addClass("flip-h")}))}destroy(e){e=e||!1,this.$n.find(".icon-arrow, .icon-chevron, .icon-chevron-compact-label").remove(),this.$n.find(".nav-item:not(a)").removeAttr("tabindex"),$(window).add(this.$n).add(this.$b).off("click resize keydown"),this.$n.removeClass("compact revealed"),this.$n.find("ul, .nav-dropdown").removeClass("justify-right flip-v flip-h"),e?window.gardenburgers[this.i]=void 0:window.gardenburgers.splice(this.i,1)}}$.fn.gardenburger=function(e){return this.each((function(){const t=$(this).data("gardenburger-options"),i=t&&"string"==typeof t?$.parseJSON(t):t;$.extend(e,i),new Gardenburger($(this),e)}))},$((function(){$("[data-gardenburger]").each((function(){$(this).gardenburger()}))}));
//# sourceMappingURL=main-min.js.map