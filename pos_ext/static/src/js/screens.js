odoo.define('point_of_sale_ext.screens', function (require) {
"use strict";

var screens = require('point_of_sale.screens');
var core = require('web.core');
var _t = core._t;

screens.ProductListWidget.include({

get_product_image_url: function(product){
 	//console.debug('get_product_image_url');
	return window.location.origin + '/web/image?model=product.product&field=image&id='+product.id;
},
 
});

screens.PaymentScreenWidget.include({
	renderElement: function() {
		var self = this;
        this._super();
        this.$('.order_only').click(function(){
        	self.pos.order_type = 'without_validate';
        	//console.debug('Ext Order Button Clicked');
            self.validate_order();
        });
	},
	validate_order: function(force_validation) {
        var self=this;
		//console.debug('Ext Validate Order =',self.pos.order_type);
		
		 if (!this.pos.get_client())
        {
            this.gui.show_popup('alert',{
                    'title': _t('Warning: Could not make a order'),
                    'body': 'Please select a customer before making an order!',
                });
        }
        else
        {
        	if (this.pos.order_type == 'with_validate')
        		this._super();
        	if (this.pos.order_type == 'without_validate' && !this.order_is_valid(force_validation))
        		this.finalize_validation();
        	else
        		self.pos.order_type = 'with_validate';
        }
		
	},
    order_changes: function(){
        this._super();
        var self = this;
        var order = this.pos.get_order();
        if (order){
            if (order.is_paid()) {
                self.$('.order_only').removeClass('highlight');
            }else{
                self.$('.order_only').addClass('highlight');
            }
        }
    },
	
	
});



//end
});


