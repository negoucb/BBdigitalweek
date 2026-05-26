
/*fluxo de página*/
function navigate(pageId, element) {


  const pages = document.querySelectorAll('.page');

  pages.forEach(page => {
    page.style.display = 'none';
  });


  document.getElementById(pageId).style.display = 'block';


  
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.classList.remove('active');
  });


  element.classList.add('active');
}



document.addEventListener('DOMContentLoaded', () => {

  const pages = document.querySelectorAll('.page');

  pages.forEach(page => {
    page.style.display = 'none';
  });

  document.getElementById('dashboard').style.display = 'block';

});

/*botôes pop up*/

function abrirPopup(){

    document.getElementById("popupForm").style.display = "block";

    document.getElementById("overlay").style.display = "block";
}

function fecharPopup(){

    document.getElementById("popupForm").style.display = "none";

    document.getElementById("overlay").style.display = "none";
}



/*card-evento*/

function abrirPopupCard(){

    document.getElementById("popupEvento").style.display = "flex";
}

function fecharPopupCard(){

    document.getElementById("popupEvento").style.display = "none";
}



/**************************** */
function abrirPopupTrilhas() {
    document.getElementById("popupTrilhas").style.display = "flex";
}

function fecharPopupTrilhas() {
    document.getElementById("popupTrilhas").style.display = "none";
}
/********************************** */
function abrirPopupAtividades() {
    document.getElementById("popupAtividades").style.display = "flex";
}

function fecharPopupAtividades() {
    document.getElementById("popupAtividades").style.display = "none";
}
/******************************** */


function abrirPopupPalestrantes() {
    document.getElementById("popupPalestrantes").style.display = "flex";
}

function fecharPopupPalestrantes() {
    document.getElementById("popupPalestrantes").style.display = "none";
}

/*************************************** */

function abrirPopupEspacos() {
    document.getElementById("popupEspacos").style.display = "flex";
}

function fecharPopupEspacos() {
    document.getElementById("popupEspacos").style.display = "none";
}

/**************************************** */

function abrirPopupHorarios() {
    document.getElementById("popupHorarios").style.display = "flex";
}

function fecharPopupHorarios() {
    document.getElementById("popupHorarios").style.display = "none";
}

/**---------------------------------------------
 * formulario
 ----------------------------------------------*/

 function abrirPopupTrilhasForm() {

    document.getElementById("popupFormTrilhas").style.display = "flex";

    document.getElementById("overlayTrilhas").style.display = "block";
}

function fecharPopupTrilhasForm() {

    document.getElementById("popupFormTrilhas").style.display = "none";

    document.getElementById("overlayTrilhas").style.display = "none";
}



function abrirPopupAtividadesForm() {

    document.getElementById("popupFormAtividades").style.display = "flex";

    document.getElementById("overlayAtividades").style.display = "block";
}

function fecharPopupAtividadesForm() {

    document.getElementById("popupFormAtividades").style.display = "none";

    document.getElementById("overlayAtividades").style.display = "none";
}



function abrirPopupPalestrantesForm() {

    document.getElementById("popupFormPalestrantes").style.display = "flex";

    document.getElementById("overlayPalestrantes").style.display = "block";
}

function fecharPopupPalestrantesForm() {

    document.getElementById("popupFormPalestrantes").style.display = "none";

    document.getElementById("overlayPalestrantes").style.display = "none";
}



function abrirPopupEspacosForm() {

    document.getElementById("popupFormEspacos").style.display = "flex";

    document.getElementById("overlayEspacos").style.display = "block";
}

function fecharPopupEspacosForm() {

    document.getElementById("popupFormEspacos").style.display = "none";

    document.getElementById("overlayEspacos").style.display = "none";
}



function abrirPopupHorariosForm() {

    document.getElementById("popupFormHorarios").style.display = "flex";

    document.getElementById("overlayHorarios").style.display = "block";
}

function fecharPopupHorariosForm() {

    document.getElementById("popupFormHorarios").style.display = "none";

    document.getElementById("overlayHorarios").style.display = "none";
}





function toggleAgendaFilters(){

    const filtros = document.getElementById(
        "agendaFiltersPanel"
    );

    filtros.classList.toggle("active");
}
