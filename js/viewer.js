class Viewer {
    constructor(parent_id, search_val, webXyzPath, expt_or_ideal, title, width, height, j2s_path){
        this.parent_id = parent_id;
        this.search_val = search_val;
	this.webXyzPath = webXyzPath;
        this.expt_or_ideal = expt_or_ideal.toLowerCase();
        this.title = title;
        this.width = width;
        this.height = height;
        this.j2s_path = j2s_path;

	// options: path or search_val
	// path = search with file path
	// search_val = search with value entered
        this.search_with = "path"; 

        this.model = `${search_val}_${expt_or_ideal}_model`;
        this.model_container_id = `${this.search_val}_${this.expt_or_ideal}_container`;
	this.default_background = "white";
	this.alt_background = "#E2F4F5";
	this.default_foreground = "black";
	this.menu_background = "hsl(0,0%,80%)";
	this.menu_border = "hsl(0,0%,70%)";
	this.menu_padding = "2px 2px";
	this.menu_width = "30px";
	this.menu_height = "30px";
	this.default_menu_background = "#337ab7";
	this.default_menu_padding = "6px 12px";
	this.default_menu_border = "#2e6da4";
	this.menu_icon = "images/icons8-hamburger-menu-50.png";

        document.getElementById(this.parent_id).innerHTML = `
<div style="width:${this.width - 10}px;height:${this.height - 10}px;" class="container jsmol_search_result_table">
    <div class="row" style="padding:5px;">
        <label style="padding-left:5px;">${this.title}</label>
        <div class="dropdown" style="position:relative;z-index:10;display:inline-block;float:right;padding-right:5px;">
            <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" style="background-color:${this.menu_background};padding:${this.menu_padding};border-color:${this.menu_border};">
                <span>
		    <img src="${this.menu_icon}" style="width:${this.menu_width};height:${this.menu_height};">
                </span>
            </button>
            <ul class="dropdown-menu">
                <li class="jsmol-hydrogens">
                    <a>hydrogens<span style="float:right;visibility:hidden;">&check;</span></a>
                </li>
		<!--
                <li class="jsmol-index-labels">
                    <a>index labels<span style="float:right;visibility:hidden;">&check;</span></a>
                </li>
		-->
                <li class="jsmol-atom-labels">
                    <a>atom labels<span style="float:right;visibility:hidden;">&check;</span></a>
                </li>
                <li class="jsmol-foreground">
                    <a>foreground<span style="float:right;visibility:hidden;">&check;</span></a>
                </li>
                <li class="jsmol-background">
                    <a>background<span style="float:right;visibility:hidden;">&check;</span></a>
                </li>
                <li class="jsmol-wireframe">
                    <a>wireframe<span style="float:right;visibility:hidden;">&check;</span></a>
                </li>
            </ul>
        </div>
    </div>
    <div id="${this.model_container_id}" style="position:relative;z-index:1;" class="row">
    </div>
</div>
`;
        this.JmolInfo = {
            j2sPath:this.j2s_path,
            serverURL: "",
            width:this.width - 10,
            height:this.height - 75,
            debug: false,
            color:this.default_background,
            disableJ2SLoadMonitor: true,
            disableInitialConsole: true,
            addSelectionOptions: false,
            use: 'HTML5',
            readyFunction: null,
            script: ""
        };
        if(this.search_with == "path"){
           this.searchMol(this.webXyzPath);
        } else {
           this.searchMol(this.search_val);
        }
        this.initializeComponents();
    }
    searchMol(accession) {
	Jmol.setDocument(0);
        Jmol.getApplet(this.model, this.JmolInfo);
        // insert model
        document.querySelector(`#${this.model_container_id}`).innerHTML = Jmol.getAppletHtml(eval(this.model));
        if(this.expt_or_ideal.toLowerCase() == 'expt') {
            if(this.search_with == "path"){
               Jmol.script(eval(this.model), `load ${accession} FILTER "NOIDEAL"`);
            } else {
               Jmol.script(eval(this.model), `load "==${accession}" FILTER "NOIDEAL"`);
            }
        } else {
            if(this.search_with == "path"){
               Jmol.script(eval(this.model), `load ${accession};`);
            } else {
               Jmol.script(eval(this.model), `load "==${accession}"`);
            }
        }
        Jmol.script(eval(this.model), 'hide _H');
        Jmol.script(eval(this.model), 'labels OFF');
        // insert model
        //document.querySelector(`#${this.model_container_id}`).innerHTML = Jmol.getAppletHtml(eval(this.model));
	this.resetLarge();
    };
    initializeComponents(){
        let boxes = document.getElementById(this.parent_id).getElementsByClassName("jsmol-hydrogens");
        for(let x = 0;x < boxes.length;++x)
        {
            boxes[x].addEventListener('click', function () {
		window.event.stopPropagation();
                let box = window.event.target;
                let span = box.getElementsByTagName('span')[0];
                let checked;
                if(span.style.visibility == 'hidden'){
                    span.style.visibility = 'visible';
                    checked = true;
                } else if(span.style.visibility == 'visible'){
                    span.style.visibility = 'hidden';
                    checked = false;
                }
                this.toggleHydrogens(checked);
            }.bind(this));
        }
	/**
        boxes = document.getElementById(this.parent_id).getElementsByClassName("jsmol-index-labels");
        for(let x = 0;x < boxes.length;++x) {
            boxes[x].addEventListener('click', function () {
		window.event.stopPropagation();
                let box = window.event.target;
                let span = box.getElementsByTagName('span')[0];
                let checked;
                if(span.style.visibility == 'hidden'){
                    span.style.visibility = 'visible';
                    checked = true;
                } else if(span.style.visibility == 'visible'){
                    span.style.visibility = 'hidden';
                    checked = false;
                }
                this.toggleIndexLabels(checked);
		let sibling = span.parentNode.parentNode.nextElementSibling;
		sibling.getElementsByTagName('span')[0].style.visibility = 'hidden';
            }.bind(this));
        }
	**/
        boxes = document.getElementById(this.parent_id).getElementsByClassName("jsmol-atom-labels");
        for(let x = 0;x < boxes.length;++x) {
            boxes[x].addEventListener('click', function () {
		window.event.stopPropagation();
                let box = window.event.target;
                let span = box.getElementsByTagName('span')[0];
                let checked;
                if(span.style.visibility == 'hidden'){
                    span.style.visibility = 'visible';
                    checked = true;
                } else if(span.style.visibility == 'visible'){
                    span.style.visibility = 'hidden';
                    checked = false;
                }
                this.toggleAtomLabels(checked);
		let sibling = span.parentNode.parentNode.previousElementSibling;
		sibling.getElementsByTagName('span')[0].style.visibility = 'hidden';
            }.bind(this));
        }
        boxes = document.getElementById(this.parent_id).getElementsByClassName("jsmol-foreground");
        for(let x = 0;x < boxes.length;++x) {
            boxes[x].addEventListener('click', function () {
		window.event.stopPropagation();
                let box = window.event.target;
                let span = box.getElementsByTagName('span')[0];
                let checked;
                if(span.style.visibility == 'hidden'){
                    span.style.visibility = 'visible';
                    checked = true;
                } else if(span.style.visibility == 'visible'){
                    span.style.visibility = 'hidden';
                    checked = false;
                }
                this.toggleForeground(checked);
            }.bind(this));
        }
        boxes = document.getElementById(this.parent_id).getElementsByClassName("jsmol-background");
        for(let x = 0;x < boxes.length;++x) {
            boxes[x].addEventListener('click', function () {
		window.event.stopPropagation();
                let box = window.event.target;
                let span = box.getElementsByTagName('span')[0];
                let checked;
                if(span.style.visibility == 'hidden'){
                    span.style.visibility = 'visible';
                    checked = true;
                } else if(span.style.visibility == 'visible'){
                    span.style.visibility = 'hidden';
                    checked = false;
                }
                this.toggleBackground(checked);
            }.bind(this));
        }
        boxes = document.getElementById(this.parent_id).getElementsByClassName("jsmol-wireframe");
        for(let x = 0;x < boxes.length;++x) {
            boxes[x].addEventListener('click', function () {
		window.event.stopPropagation();
                let box = window.event.target;
                let span = box.getElementsByTagName('span')[0];
                let checked;
                if(span.style.visibility == 'hidden'){
                    span.style.visibility = 'visible';
                    checked = true;
                } else if(span.style.visibility == 'visible'){
                    span.style.visibility = 'hidden';
                    checked = false;
                }
                this.toggleWireframe(checked);
		//let sibling = span.parentNode.parentNode.previousElementSibling;
		//sibling.getElementsByTagName('span')[0].style.visibility = 'hidden';
            }.bind(this));
        }
    }
    toggleHydrogens(checked) {
        let myJmol = this.model;
        if(checked) {
            Jmol.script(eval(myJmol), 'hide none');
        } else {
            Jmol.script(eval(myJmol), 'hide _H');
        }
    }
    toggleIndexLabels(checked) {
        let myJmol = this.model;
        if(checked) {
            // %a, %e, %i
            Jmol.script(eval(myJmol), `labels "%e %i"`);
        } else {
            Jmol.script(eval(myJmol), 'labels OFF');
        }
    }
    toggleAtomLabels(checked) {
        let myJmol = this.model;
        if(checked) {
            // %a, %e, %i
            Jmol.script(eval(myJmol), `labels "%a"`);
        } else {
            Jmol.script(eval(myJmol), 'labels OFF');
        }
    }
    toggleForeground(checked) {
        let myJmol = this.model;
        if(checked) {
            Jmol.script(eval(myJmol), `color labels ${this.default_foreground}`);
        } else {
            Jmol.script(eval(myJmol), 'color labels cpk');
        }
    }
    toggleBackground(checked) {
        let myJmol = this.model;
        if(checked) {
            Jmol.script(eval(myJmol), `background "${this.alt_background}"`);
        } else {
            Jmol.script(eval(myJmol), `background "${this.default_background}"`);
        }
    }
    resetSmall(){
	    let reset = "wireframe reset;spacefill reset;";
	    Jmol.script(eval(this.model), reset);
    }
    resetLarge(){
	    this.resetSmall();
	    let wireframe = "wireframe on;wireframe 0.10;spacefill 0.30;";
	    Jmol.script(eval(this.model), wireframe);
    }
    toggleWireframe(checked) {
        let myJmol = this.model;
        if(checked) {
	    this.resetSmall();
	    let wireframe = "wireframe on;wireframe 0.10;spacefill off;";
	    Jmol.script(eval(this.model), wireframe);
        } else {
	    this.resetLarge();
        }
    }
}
