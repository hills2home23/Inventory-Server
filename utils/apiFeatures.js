class apiFeatures {
  constructor(query, querStr) {
    this.query = query;
    this.querStr = querStr;
  }

  filter() {
    //1) Filtering
    const queryObj = { ...this.querStr };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    //Since we will be dealing with all of the above filters later
    excludedFields.forEach(el => delete queryObj[el]);

    //1a)Advanced Filtering
    let querStr = JSON.stringify(queryObj);
    querStr = querStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    console.log(JSON.parse(querStr));
    this.query.find(JSON.parse(querStr));
    return this;
  }

  sort() {
    //1b)Sorting
    if (this.querStr.sort) {
      const sortBy = this.querStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      //Making when there is no sort mentioned then we sort by creation date
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.querStr.fields) {
      const fields = this.querStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //By using this we are excluding this
    }
    return this;
  }

  paginate() {
    const page = this.querStr.page * 1 || 1;
    const limit = this.querStr.limit * 1 || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = apiFeatures;
