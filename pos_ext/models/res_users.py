import logging
from datetime import timedelta
from functools import partial

import psycopg2
import pytz

from odoo import api, fields, models, tools, _
from odoo.tools import float_is_zero
from odoo.exceptions import UserError
from odoo.http import request

class Users(models.Model):
    _inherit = "res.users"
    
    pos_ids = fields.Many2one('pos.config',string="Point Of Sale")