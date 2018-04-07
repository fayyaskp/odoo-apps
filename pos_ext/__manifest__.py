{
    'name': 'Point of Sale Ext',
    'version': '1.0',
    'category': 'Point of sale',
    'author':'Htcorps Pvt.Ltd',
    'description': "Coming Soon",
    'depends': ['point_of_sale','sale_management'],
    'website': 'http://www.htcorps.com',
    'data': ['views/point_of_sale.xml',
             'views/pos_order_views.xml',
             'views/pos_config_view.xml',
             ],
    'installable': True,
    'application': True,
    'qweb': ['static/src/xml/*.xml'],
    
}
