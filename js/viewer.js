class Viewer {
    constructor(parent_id, search_val, expt_or_ideal, title, width, height, j2s_path){
        this.parent_id = parent_id;
        this.search_val = search_val;
        this.expt_or_ideal = expt_or_ideal.toLowerCase();
        this.title = title;
        this.width = width;
        this.height = height;
        this.j2s_path = j2s_path;
        this.model = `${search_val}_${expt_or_ideal}_model`;
        this.model_container_id = `${this.search_val}_${this.expt_or_ideal}_container`;
        document.getElementById(this.parent_id).innerHTML = `
<div style="width:${this.width - 10}px;height:${this.height - 10}px;" class="container jsmol_search_result_table">
    <div class="row">
        <label style="padding-left:5px;">${this.title}</label>
        <div class="dropdown" style="position:relative;z-index:10;display:inline-block;float:right;padding-right:5px;">
            <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                <span>
                    <i class="fas fa-bars fa-1x"></i>
                </span>
            </button>
            <ul class="dropdown-menu">
                <li class="hydrogens">
                    <a>hydrogens<span style="float:right;visibility:hidden;">&check;</span></a>
                </li>
                <li class="labels">
                    <a>labels<span style="float:right;visibility:hidden;">&check;</span></a>
                </li>
                <li class="foreground">
                    <a>foreground<span style="float:right;visibility:hidden;">&check;</span></a>
                </li>
                <li class="background">
                    <a>background<span style="float:right;visibility:hidden;">&check;</span></a>
                </li>
            </ul>
        </div>
    </div>
    <div id="${this.model_container_id}" style="position:relative;z-index:1;" class="row">
    </div>
</div>
`;
        this.JmolInfo = {
            width:this.width - 10,
            height:this.height - 75,
            color:'#E2F4F5',
            j2sPath:this.j2s_path,
            use: 'HTML5'
        };
        // this.initialize();
    }
    initialize(){
        this.searchMol(this.search_val);
        let boxes = document.getElementById(this.parent_id).getElementsByClassName("hydrogens");
        for(let x = 0;x < boxes.length;++x)
        {
            boxes[x].addEventListener('click', function () {
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
        boxes = document.getElementById(this.parent_id).getElementsByClassName("labels");
        for(let x = 0;x < boxes.length;++x) {
            boxes[x].addEventListener('click', function () {
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
                this.toggleLabels(checked);
            }.bind(this));
        }
        boxes = document.getElementById(this.parent_id).getElementsByClassName("foreground");
        for(let x = 0;x < boxes.length;++x) {
            boxes[x].addEventListener('click', function () {
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
        boxes = document.getElementById(this.parent_id).getElementsByClassName("background");
        for(let x = 0;x < boxes.length;++x) {
            boxes[x].addEventListener('click', function () {
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
    }
    searchMol(accession) {
        Jmol.getApplet(this.model, this.JmolInfo);
        if(this.expt_or_ideal.toLowerCase() == 'expt') {
            Jmol.script(eval(this.model), `load "==${accession}" FILTER "NOIDEAL"`);
        } else {
            Jmol.script(eval(this.model), `load "==${accession}"`);
        }
        Jmol.script(eval(this.model), 'hide _H');
        Jmol.script(eval(this.model), 'labels OFF');
        // insert model
        document.querySelector(`#${this.model_container_id}`).innerHTML = Jmol.getAppletHtml(eval(this.model));
    };
    toggleHydrogens(checked) {
        let myJmol = this.model;
        if(checked) {
            Jmol.script(eval(myJmol), 'hide none');
        } else {
            Jmol.script(eval(myJmol), 'hide _H');
        }
    }
    toggleLabels(checked) {
        let myJmol = this.model;
        if(checked) {
            // %a, %e, %i
            Jmol.script(eval(myJmol), `labels "%e %i"`);
        } else {
            Jmol.script(eval(myJmol), 'labels OFF');
        }
    }
    toggleForeground(checked) {
        let myJmol = this.model;
        if(checked) {
            Jmol.script(eval(myJmol), 'color labels black');
        } else {
            Jmol.script(eval(myJmol), 'color labels cpk');
        }
    }
    toggleBackground(checked) {
        let myJmol = this.model;
        if(checked) {
            Jmol.script(eval(myJmol), 'background black');
        } else {
            Jmol.script(eval(myJmol), 'background "#E2F4F5"');
        }
    }
}
