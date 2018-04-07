odoo.define('pos_ext.pos_uom', function (require) {
"use strict";

var core = require('web.core');
var screens = require('point_of_sale.screens');

var _t = core._t;

var UomButton = screens.ActionButtonWidget.extend({
    template: 'UomButton',
    button_click: function(){
        var self = this;
        var order = self.pos.get_order();
        var order_line = order.get_selected_orderline();
        if (order_line)
        {
        /*
        this.gui.show_popup('number',{
            'title': _t('Discount Percentage'),
            'value': this.pos.config.discount_pc,
            'confirm': function(val) {
                val = Math.round(Math.max(0,Math.min(100,val)));
                self.apply_discount(val);
            },
        });
        */
         self.gui.select_uom({
                'security':     true,
                'test':'Product Name',
                'current_uom': order_line.product_uom,
                'product':order_line.get_product(),
                'title':      _t('Change UOM'),
            }).then(function(uom){
                //console.debug('Pop UOM Item seleted=',uom.id);
                
                order_line.set_uom(uom.id);
                order_line.set_unit_price(order_line.product.get_price(order.pricelist, order_line.get_quantity()));
                //console.debug('Get Selected Order Line Uom Btton=',order_line);
                
            });
        }
    },
    apply_discount: function(pc) {
        var order    = this.pos.get_order();
        var lines    = order.get_orderlines();
        var product  = this.pos.db.get_product_by_id(this.pos.config.discount_product_id[0]);

        // Remove existing discounts
        var i = 0;
        while ( i < lines.length ) {
            if (lines[i].get_product() === product) {
                order.remove_orderline(lines[i]);
            } else {
                i++;
            }
        }

        // Add discount
        var discount = - pc / 100.0 * order.get_total_with_tax();

        if( discount < 0 ){
            order.add_product(product, { price: discount });
        }
    },
});

screens.define_action_button({
    'name': 'uom',
    'widget': UomButton,
    'condition': function(){
        return this.pos.config.multi_uom && this.pos.config.uom_ids;
    },
});


});

