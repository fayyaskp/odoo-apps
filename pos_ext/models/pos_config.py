import logging
from datetime import timedelta
from functools import partial

import psycopg2
import pytz

from odoo import api, fields, models, tools, _
from odoo.tools import float_is_zero
from odoo.exceptions import UserError
from odoo.http import request

class PosConfig(models.Model):
    _inherit = "pos.config"
    
    multi_uom = fields.Boolean("Enable Multi UOM")
    uom_ids = fields.Many2many('product.uom','pos_config_uom_uom_rel','pos_config_id','uom_id','Multi Uom')