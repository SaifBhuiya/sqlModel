import sys

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from dotenv import load_dotenv
from sqlalchemy import text

# Load environment variables from Railway
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure database connection using Railway MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://{}:{}@{}/{}'.format(
    os.getenv('DB_USERNAME'),
    os.getenv('DB_PASSWORD'),
    os.getenv('DB_HOST'),
    os.getenv('DB_NAME')
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

#test connection between database and backend
@app.route('/test-db')
def test_db():
    try:
        db.session.execute(text("SELECT 1"))
        return "Database Connected!", 200
    except Exception as e:
        return str(e), 500

# Fetch all stock data
@app.route('/stocks')
def get_stocks():
    stocks = fetch_stocks()  # Reuse the function
    return jsonify(stocks)

#Retrieve sorted data (Date) for graph
@app.route('/stocksforGraph', methods = ['GET'])
def get_stocksforgraph():
    with db.engine.connect() as connection:
        result = connection.execute(text("SELECT * FROM test ORDER BY date ASC"))  # Sort by date
        stocks = [
            {
                **dict(row),
                'date': row['date'].strftime('%Y-%m-%d') if row['date'] else None,  # Format date
                'volume': str(row['volume']).replace(',', '')  # Remove commas from volume
            }
            for row in result.mappings()
        ]

    return jsonify(stocks)

#Update stocks
@app.route('/Edit', methods=['PUT'])
def edit_stocks():
    data = request.json
    with db.engine.connect() as connection:
        id = data.get("index", 0)
        result = connection.execute(text("SELECT * FROM test "
                                         "WHERE id = :id"), {"id": id})

        row = result.fetchone()
        row_dict = dict(row._mapping)

        # store all values to match later for deletion
        date_match = row_dict.get('date').strftime('%Y-%m-%d')
        trade_code_match = row_dict.get('trade_code')
        high_match = row_dict.get('high')
        low_match = row_dict.get('low')
        open_match = row_dict.get('open')
        close_match = row_dict.get('close')
        volume_match = row_dict.get('volume')

        update = connection.execute(text(
                                         "UPDATE test "
                                         "SET "
                                         "date = :ndate, "
                                         "trade_code = :ntrade_code, "
                                         "high = :nhigh, "
                                         "low = :nlow, "
                                         "open = :nopen, "
                                         "close = :nclose, "
                                         "volume = :nvolume "
                                         "WHERE "
                                         "id = :id;"),

                                    {
                                        # SET CLAUSE use new values sent to update
                                        "ndate": data.get("date", date_match),
                                        "ntrade_code": data.get("trade_code", trade_code_match),
                                        "nhigh": data.get("high", high_match),
                                        "nlow": data.get("low", low_match),
                                        "nopen": data.get("open", open_match),  # Added missing colon
                                        "nclose": data.get("close", close_match),
                                        "nvolume": data.get("volume", volume_match),

                                        # WHERE CLAUSE Match columns of the selected row
                                        "id": id

                                    }
                                )
        connection.commit()
        stocks = fetch_stocks()  # Reuse the function
        return jsonify(stocks)


#Create new Row
@app.route('/Create', methods=['POST'])
def create_data():
        data = request.json
        with db.engine.connect() as connection:
            result = connection.execute(text("INSERT INTO test (date, trade_code, high, low, open, close, volume)"
                                             "VALUES (:date, :trade_code, :high, :low, :open, :close, :volume)"
                                             ),{
            "date": data.get("date"),
            "trade_code": data.get("trade_code"),
            "high": data.get("high"),
            "low": data.get("low"),
            "open": data.get("open"),
            "close": data.get("close"),
            "volume": data.get("volume")
        })
            connection.commit()
            stocks = fetch_stocks()  # Reuse the function
            return jsonify(stocks)

#Delete a row
@app.route('/Delete', methods=['DELETE'])
def delete_data():
    id = request.args.get("id", type=int)  # Get index from URL parameter

    with db.engine.connect() as connection:
        #Find all columns of the Row which we want to delete
        result = connection.execute(text("SELECT * FROM test "
                                         "WHERE id = :id"), {"id": id})
        row = result.fetchone()
        row_dict = dict(row._mapping)

        #store all values to match later for deletion
        date_match = row_dict.get('date').strftime('%Y-%m-%d')
        trade_code_match = row_dict.get('trade_code')
        high_match = row_dict.get('high')
        low_match = row_dict.get('low')
        open_match = row_dict.get('open')
        close_match = row_dict.get('close')
        volume_match = row_dict.get('volume')

        delete = connection.execute(text("DELETE FROM test WHERE  "
                                         "id = :id"),{"id": id})
        connection.commit()

        stocks = fetch_stocks()  # Reuse the function
        return jsonify(stocks)


#Used for drop-down menu of graph
#retrieve all unique trade codes
@app.route('/get_trade_codes', methods=['GET'])
def get_trade_codes():
    with db.engine.connect() as connection:
        result = connection.execute(text("SELECT DISTINCT trade_code FROM test"))
        trade_codes = [row[0] for row in result]  # Extract values from result
    return jsonify(trade_codes)



#normal data retrieval
def fetch_stocks():
    with db.engine.connect() as connection:
        result = connection.execute(text("SELECT * FROM test"))

        stocks = [
            {
                **dict(row),
                'date': row['date'].strftime('%Y-%m-%d') if row['date'] else None  # Format date
            }
            for row in result.mappings()
        ]

    return stocks

if __name__ == '__main__':
    app.run(debug=True)
