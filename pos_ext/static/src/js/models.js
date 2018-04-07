odoo.define('point_of_sale_ext.models', function (require) {
"use strict";
var rpc = require('web.rpc');
var models = require('point_of_sale.models');
var _super_posmodel = models.PosModel.prototype;

//var exports = {};
models.PosModel = models.PosModel.extend({
	
    initialize: function (session, attributes) {
    	this.change_labels(this); 
    	this.stock = {};
    	this.order_type='with_validate';
        // Product Model
        var product_model = _.find(this.models, function(model){
            return model.model === 'product.product';
        });
        //product_model.fields.push('qty_available');
        product_model.loaded = function(self, products){
        	return rpc.query({
                model: 'product.product',
                method: 'get_stock_pos',
                args: [products[0].id,self.pos_session.id,products]
            }).then(function (stock_list) {
                self.stock = stock_list;
                 //org code
                self.db.add_products(_.map(products, function (product) {
	                product.categ = _.findWhere(self.product_categories, {'id': product.categ_id[0]});
	                return new models.Product({uom:self.units_by_id[product.uom_id[0]]}, product);
	            	}));
             });

        };
        
        return _super_posmodel.initialize.call(this, session, attributes);
    },

    change_labels:function(){
    	
    	var model_label = {
    	'res.users': '- Users',
    	'product.product':'- Products',
    	'res.company': '- Companies',
    	'decimal.precision': '- Decimal Precisions',
    	'product.uom': '- Unit Of Measures',
    	'res.partner': '- Customers',
    	'res.country': '- Countries',
    	'account.tax': '- Taxes',
    	'pos.session': '- Pos Sessions',
    	'pos.config': '- Pos Configurations',
    	'stock.location': '- Stock Locations',
    	'product.pricelist': '- Product Price Lists',
    	'product.pricelist.item': '- Product Price List Items',
    	'product.category': '- Product Categories',
    	'res.currency': '- Currencies',
    	'pos.category': '- POS Categories',
    	'account.bank.statement': '- Account Bank Statements',
    	'account.journal': '- Journals',
    	'account.fiscal.position': '- Fiscal Positions',
    	'account.fiscal.position.tax': '- Fiscal Position Taxes',
    	};
    	
    	var model_string='';
    	_.find(this.models, function(model){
    		if(model.model && model_label[model.model] != undefined)
				model.label = model_label[model.model];
	    	
        });
       
    },
 
});
var _super_posproduct = models.Product.prototype;
models.Product = models.Product.extend({
    initialize: function(attr, options){
        //console.debug('EXT initialize Product=',options)
        this.uom   = attr.uom;
        return _super_posproduct.initialize.call(this, attr, options);

    },
    get_price: function(pricelist, quantity){
        //console.debug('EXT get_price=',this.uom);
        return _super_posproduct.get_price.call(this, pricelist, quantity) / this.uom.factor_inv 

    },
});


var _super_posorder = models.Order.prototype;
models.Order = models.Order.extend({
	export_as_JSON: function() {
		//console.debug('Ext export_as_JSON =',this.pos.order_type);
        var orderLines, paymentLines;
        orderLines = [];
        this.orderlines.each(_.bind( function(item) {
            return orderLines.push([0, 0, item.export_as_JSON()]);
        }, this));
        paymentLines = [];
        this.paymentlines.each(_.bind( function(item) {
            return paymentLines.push([0, 0, item.export_as_JSON()]);
        }, this));
        return {
            name: this.get_name(),
            amount_paid: this.get_total_paid(),
            amount_total: this.get_total_with_tax(),
            amount_tax: this.get_total_tax(),
            amount_return: this.get_change(),
            lines: orderLines,
            statement_ids: paymentLines,
            pos_session_id: this.pos_session_id,
            pricelist_id: this.pricelist ? this.pricelist.id : false,
            partner_id: this.get_client() ? this.get_client().id : false,
            user_id: this.pos.get_cashier().id,
            uid: this.uid,
            sequence_number: this.sequence_number,
            creation_date: this.validation_date || this.creation_date, // todo: rename creation_date in master
            fiscal_position_id: this.fiscal_position ? this.fiscal_position.id : false,
            'order_type':this.pos.order_type,
            
            
        };
        
    },

});

var _super_posorderline = models.Orderline.prototype;

models.Orderline = models.Orderline.extend({
    initialize: function(attr,options){
        this.pos   = options.pos;
        this.order = options.order;
        if(options.product){
            //console.debug('Ext OrderLine -Initttt Pro=',options.product);
            this.set_uom(options.product.uom_id[0]);
        }
        return _super_posorderline.initialize.call(this, attr, options);
    },
    init_from_JSON: function(json) 
    {

      //console.debug('Ext OrderLine - init_from_JSON =',json.product_uom);
      this.set_uom(json.product_uom);
      return _super_posorderline.init_from_JSON.call(this, json);  
    },
    clone: function()
    {
        var orderline = _super_posorderline.clone.call(this); 
        order_line.uomStr = this.uomStr;
        order_line.product_uom = this.product_uom; 
        return orderline;
    },
    set_uom: function(uom_id)
    {
        //console.debug('Ext set_uom');
        this.order.assert_editable();
        this.uomStr=this.pos.units_by_id[uom_id].name;
        this.product_uom = uom_id;
        this.trigger('change',this);
        
    },
    get_uom: function(){
        //console.debug('Ext get_uom');
        return this.product_uom;
    },
    get_uomStr: function()
    {
        //console.debug('Ext get_uomStr');
        return this.uomStr;
    },
    get_quantity_str_with_unit: function()
    {
        var qty_str_with_unit = _super_posorderline.get_quantity_str_with_unit.call(this);  
        //console.debug('EXT get_quantity_str_with_unit=',qty_str_with_unit);
        var unit = this.pos.units_by_id[this.get_uom()];
        if(unit && !unit.is_pos_groupable){
            return this.quantityStr + ' ' + unit.name;
        }else{
            return this.quantityStr;
        }
    },
    export_as_JSON: function() 
    {

        var json = _super_posorderline.export_as_JSON.call(this);
        json.product_uom = this.get_uom();
        //console.debug('EXT export_as_JSON OrderLine=',json);
        return json;
    },
    export_for_printing: function()
    {
        //console.debug('Ext export_for_printing order line=',);
        var printing_data = _super_posorderline.export_for_printing.call(this);
        printing_data.unit_name = this.get_uomStr();
        //console.debug('Ext export_for_printing = ',printing_data);
        return printing_data;
    },

    set_unit_price: function(price){
        _super_posorderline.set_unit_price.call(this,price);
        //console.debug('EXT set_unit_price=',this.price);
        //htcorps
        if (this.product_uom)
        {
            this.order.assert_editable();
            this.price = this.price * this.pos.units_by_id[this.product_uom].factor_inv
            this.trigger('change',this);
        }
        
    },

});


//end
});


