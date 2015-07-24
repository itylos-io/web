/**
 * Created by bober on 15/3/2015.
 */
app.directive('uiSelectRequired', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl,ngModel) {
            console.log(attrs);
            //console.log(elm);
            scope.$watch(attrs.myCurrentTime, function(value) {
                ctrl.$validators.uiSelectRequired = function(modelValue, viewValue) {
                    //console.log(modelValue);
                    //console.log(viewValue);
                    var determineVal;
                    if (angular.isArray(modelValue)) {
                        //console.log('1');
                        determineVal = modelValue;
                    } else if (angular.isArray(viewValue)) {
                       // console.log('2');
                        determineVal = viewValue;
                    } else {
                       // console.log('3');
                        return false;
                    }
                    return determineVal.length > 0;
                };
            });
        }
    };
});