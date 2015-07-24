/**
 * Created by bober on 15/3/2015.
 */
app.directive('uiSelectRequired', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl,ngModel) {
            scope.$watch(attrs.myCurrentTime, function(value) {
                ctrl.$validators.uiSelectRequired = function(modelValue, viewValue) {
                     var determineVal;
                    if (angular.isArray(modelValue)) {
                        determineVal = modelValue;
                    } else if (angular.isArray(viewValue)) {
                        determineVal = viewValue;
                    } else {
                        return false;
                    }
                    return determineVal.length > 0;
                };
            });
        }
    };
});