from odoo import models,api


class ProductProduct(models.Model):
    _inherit = 'product.product'
    
    @api.multi
    def get_stock_pos(self,pos_id,products):
        stock_list ={}
        obj_pos_session = self.env['pos.session']
        obj_quant = self.env['stock.quant']
        if self and pos_id:
            location_id  = obj_pos_session.browse(pos_id).config_id.stock_location_id.id
            for product in products:
                quants=obj_quant.search([('location_id','=',location_id),
                                        ('product_id','=',product['id'])])
                stock_list[product['id']] = (quants and sum(quants.mapped('quantity'))) or 0 - (quants and sum(quants.mapped('reserved_quantity')) or 0)
        return  stock_list

    