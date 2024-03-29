(function($) {   // fonction anonyme auto-invoquée qui prend un seul paramètre $ 
  $.fn.mauGallery = function(options) { 
    // $.fn = permet d'ajouter de nouvelles méthodes à l'objet jQuery
    // mauGallery = a simple jQuery gallery for bootstrap 4 
    // options = objet JavaScript 
    var options = $.extend($.fn.mauGallery.defaults, options);
    // $.extend() = méthode fournie par jQuery pour fusionner le contenu de deux 
    // ou plusieurs objets JavaScript en un seul objet
    var tagsCollection = [];  // liste des noms des filtres
    return this.each(function() {
    //   if (window.innerWidth <= 768) {
    //     console.log("La taille de l'écran est inférieure ou égale à 768 pixels.");
    // } else {
    //     console.log("La taille de l'écran est supérieure à 768 pixels.");
    //     $(".carousel-inner .carousel-item:nth-child(1) img").attr("src", "./assets/images/slider/ryori-iwata-DESKTOP.jpg");
    //     $(".carousel-inner .carousel-item:nth-child(2) img").attr("src", "./assets/images/slider/nicholas-green-DESKTOP.jpg");
    //     $(".carousel-inner .carousel-item:nth-child(3) img").attr("src", "./assets/images/slider/edward-cisneros-DESKTOP.jpg");
    // }
      $.fn.mauGallery.methods.createRowWrapper($(this));
      // lightBox = modale "gallerie" + bckground assombri
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),  // élément jQuery actuel sur lequel la méthode est invoquée
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);
      // ici, méthode qui est responsable d'attacher des gestionnaires d'événements 
      // à différents éléments de la galerie
      $(this)
        .children(".gallery-item")  // images de la gallerie
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  // configure la gallerie (=/= lightbox)
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  // ouverture de la lightbox
  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // différents gestionnaires d'événements sont attachés à des 
    // éléments spécifiques de la galerie

    // nav-link = filtre
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag
    );
    
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    prevImage() {
      let activeImage = undefined;
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");

      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() { // get all images for "any" filter
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() { // get all filtered images
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = imagesCollection.length,
      prev = null;

      $(imagesCollection).each(function(i) {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = imagesCollection[i-1];
          index = i-1;
        }
      });
      let lastImage = imagesCollection.length-1;
      prev = imagesCollection[index] || imagesCollection[lastImage];
      $(".lightboxImage").attr("src", $(prev).attr("src"));
    },
    nextImage() {
      let activeImage = undefined;
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");

      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() { // get all images for "any" filter
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() { // get all filtered images
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;
      

      $(imagesCollection).each(function(i) {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = imagesCollection[i+1] || imagesCollection[0];
          index = i+1;
        }
      });

      // $(imagesCollection).each(function(i) {    // get active image index
      //   if ($(activeImage).attr("src") === $(this).attr("src")) {
      //     index = i;
      //   }
      // });
      
      // next = (index<imagesCollection.length) ? imagesCollection[index] : imagesCollection[0];
      next = imagesCollection[index] || imagesCollection[0];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" aria-label="Image précédente" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next"  aria-label="Image suivante" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      if ($("active-tag")) {
        $('.nav-link').css("color", "black");
        $('.nav-link').css("background-color", "transparent");
        $(this).css("color", "#fff");
        $(this).css("background-color", "#7B7014");
      }
      $(".active-tag").removeClass("active-tag");
      $(this).addClass("active-tag");
      
      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);
