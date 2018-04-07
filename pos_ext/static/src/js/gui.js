odoo.define('point_of_sale_ext.gui', function (require) {
"use strict";
var gui = require('point_of_sale.gui');
gui.Gui.include({
	select_uom: function(options){
		//console.debug('Ext select_uom');
        options = options || {};
        var self = this;
        var def  = new $.Deferred();
        var list = [];
        //console.debug('select_uom pop up=====',options.current_uom);
        //making curent uom first selected then default uom second item
        var current_default_uom = [options.current_uom];
        if (current_default_uom[0] != options.product.uom_id[0])
        {
            current_default_uom.push(options.product.uom_id[0]);
        }
        if (current_default_uom){
            for (var i = 0; i < current_default_uom.length; i++)
            {
                var uom = this.pos.units_by_id[current_default_uom[i]];
                list.push({
                        'label': uom.name,
                        'item':  uom,
                });
            }
        }
        for (var i = 0; i < this.pos.config.uom_ids.length; i++) {
            if (current_default_uom.indexOf(this.pos.config.uom_ids[i]) == -1){
                var uom = this.pos.units_by_id[this.pos.config.uom_ids[i]];
                list.push({
                        'label': uom.name,
                        'item':  uom,
                });
            }
            
        }

        this.show_popup('selection',{
            title: options.title || _t('Select UOM - '),
            list: list,
            confirm: function(uom){ def.resolve(uom); },
            cancel: function(){ def.reject(); },
            is_selected: function(uom){ return uom === this.pos.units_by_id[options.current_uom] },
        });

        return def.then(function(uom){
            //console.debug('Uom Selected==',uom);
            return uom;
            /*
            if (options.security && user !== options.current_user && user.pos_security_pin) {
                return self.ask_password(user.pos_security_pin).then(function(){
                    return user;
                });
            } else {
                return user;
            }
            */
        });
    },
    });

});
