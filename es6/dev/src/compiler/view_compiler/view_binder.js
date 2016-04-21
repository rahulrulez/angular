import { ListWrapper } from 'angular2/src/facade/collection';
import { templateVisitAll } from '../template_ast';
import { bindRenderText, bindRenderInputs, bindDirectiveInputs, bindDirectiveHostProps } from './property_binder';
import { bindRenderOutputs, collectEventListeners, bindDirectiveOutputs } from './event_binder';
import { bindDirectiveAfterContentLifecycleCallbacks, bindDirectiveAfterViewLifecycleCallbacks, bindDirectiveDestroyLifecycleCallbacks, bindDirectiveDetectChangesLifecycleCallbacks } from './lifecycle_binder';
export function bindView(view, parsedTemplate) {
    var visitor = new ViewBinderVisitor(view);
    templateVisitAll(visitor, parsedTemplate);
}
class ViewBinderVisitor {
    constructor(view) {
        this.view = view;
        this._nodeIndex = 0;
    }
    visitBoundText(ast, parent) {
        var node = this.view.nodes[this._nodeIndex++];
        bindRenderText(ast, node, this.view);
        return null;
    }
    visitText(ast, parent) {
        this._nodeIndex++;
        return null;
    }
    visitNgContent(ast, parent) { return null; }
    visitElement(ast, parent) {
        var compileElement = this.view.nodes[this._nodeIndex++];
        var eventListeners = collectEventListeners(ast.outputs, ast.directives, compileElement);
        bindRenderInputs(ast.inputs, compileElement);
        bindRenderOutputs(eventListeners);
        ListWrapper.forEachWithIndex(ast.directives, (directiveAst, index) => {
            var directiveInstance = compileElement.directiveInstances[index];
            bindDirectiveInputs(directiveAst, directiveInstance, compileElement);
            bindDirectiveDetectChangesLifecycleCallbacks(directiveAst, directiveInstance, compileElement);
            bindDirectiveHostProps(directiveAst, directiveInstance, compileElement);
            bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners);
        });
        templateVisitAll(this, ast.children, compileElement);
        // afterContent and afterView lifecycles need to be called bottom up
        // so that children are notified before parents
        ListWrapper.forEachWithIndex(ast.directives, (directiveAst, index) => {
            var directiveInstance = compileElement.directiveInstances[index];
            bindDirectiveAfterContentLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            bindDirectiveAfterViewLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            bindDirectiveDestroyLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
        });
        return null;
    }
    visitEmbeddedTemplate(ast, parent) {
        var compileElement = this.view.nodes[this._nodeIndex++];
        var eventListeners = collectEventListeners(ast.outputs, ast.directives, compileElement);
        ListWrapper.forEachWithIndex(ast.directives, (directiveAst, index) => {
            var directiveInstance = compileElement.directiveInstances[index];
            bindDirectiveInputs(directiveAst, directiveInstance, compileElement);
            bindDirectiveDetectChangesLifecycleCallbacks(directiveAst, directiveInstance, compileElement);
            bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners);
            bindDirectiveAfterContentLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            bindDirectiveAfterViewLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            bindDirectiveDestroyLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
        });
        return null;
    }
    visitAttr(ast, ctx) { return null; }
    visitDirective(ast, ctx) { return null; }
    visitEvent(ast, eventTargetAndNames) {
        return null;
    }
    visitVariable(ast, ctx) { return null; }
    visitDirectiveProperty(ast, context) { return null; }
    visitElementProperty(ast, context) { return null; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19iaW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWtLTHJHa09QLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvdmlld19jb21waWxlci92aWV3X2JpbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUNMLFdBQVcsRUFDWixNQUFNLGdDQUFnQztPQUNoQyxFQWNMLGdCQUFnQixFQUdqQixNQUFNLGlCQUFpQjtPQUNqQixFQUNMLGNBQWMsRUFDZCxnQkFBZ0IsRUFDaEIsbUJBQW1CLEVBQ25CLHNCQUFzQixFQUN2QixNQUFNLG1CQUFtQjtPQUNuQixFQUFDLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sZ0JBQWdCO09BQ3RGLEVBQ0wsMkNBQTJDLEVBQzNDLHdDQUF3QyxFQUN4QyxzQ0FBc0MsRUFFdEMsNENBQTRDLEVBQzdDLE1BQU0sb0JBQW9CO0FBSTNCLHlCQUF5QixJQUFpQixFQUFFLGNBQTZCO0lBQ3ZFLElBQUksT0FBTyxHQUFHLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFFRDtJQUdFLFlBQW1CLElBQWlCO1FBQWpCLFNBQUksR0FBSixJQUFJLENBQWE7UUFGNUIsZUFBVSxHQUFXLENBQUMsQ0FBQztJQUVRLENBQUM7SUFFeEMsY0FBYyxDQUFDLEdBQWlCLEVBQUUsTUFBc0I7UUFDdEQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDOUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0Qs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QyxZQUFZLENBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUN6QyxjQUFjLENBQUMsQ0FBQztZQUM1RCx3Q0FBd0MsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUN6QyxjQUFjLENBQUMsQ0FBQztZQUN6RCxzQ0FBc0MsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLGlCQUFpQixFQUN6QyxjQUFjLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUyxDQUFDLEdBQVksRUFBRSxHQUFRLElBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdkQsY0FBYyxDQUFDLEdBQWlCLEVBQUUsR0FBUSxJQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLFVBQVUsQ0FBQyxHQUFrQixFQUFFLG1CQUErQztRQUM1RSxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGFBQWEsQ0FBQyxHQUFnQixFQUFFLEdBQVEsSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMvRCxzQkFBc0IsQ0FBQyxHQUE4QixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMxRixvQkFBb0IsQ0FBQyxHQUE0QixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN4RixDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBMaXN0V3JhcHBlcixcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIFRlbXBsYXRlQXN0LFxuICBUZW1wbGF0ZUFzdFZpc2l0b3IsXG4gIE5nQ29udGVudEFzdCxcbiAgRW1iZWRkZWRUZW1wbGF0ZUFzdCxcbiAgRWxlbWVudEFzdCxcbiAgVmFyaWFibGVBc3QsXG4gIEJvdW5kRXZlbnRBc3QsXG4gIEJvdW5kRWxlbWVudFByb3BlcnR5QXN0LFxuICBBdHRyQXN0LFxuICBCb3VuZFRleHRBc3QsXG4gIFRleHRBc3QsXG4gIERpcmVjdGl2ZUFzdCxcbiAgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCxcbiAgdGVtcGxhdGVWaXNpdEFsbCxcbiAgUHJvcGVydHlCaW5kaW5nVHlwZSxcbiAgUHJvdmlkZXJBc3Rcbn0gZnJvbSAnLi4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7XG4gIGJpbmRSZW5kZXJUZXh0LFxuICBiaW5kUmVuZGVySW5wdXRzLFxuICBiaW5kRGlyZWN0aXZlSW5wdXRzLFxuICBiaW5kRGlyZWN0aXZlSG9zdFByb3BzXG59IGZyb20gJy4vcHJvcGVydHlfYmluZGVyJztcbmltcG9ydCB7YmluZFJlbmRlck91dHB1dHMsIGNvbGxlY3RFdmVudExpc3RlbmVycywgYmluZERpcmVjdGl2ZU91dHB1dHN9IGZyb20gJy4vZXZlbnRfYmluZGVyJztcbmltcG9ydCB7XG4gIGJpbmREaXJlY3RpdmVBZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3MsXG4gIGJpbmREaXJlY3RpdmVBZnRlclZpZXdMaWZlY3ljbGVDYWxsYmFja3MsXG4gIGJpbmREaXJlY3RpdmVEZXN0cm95TGlmZWN5Y2xlQ2FsbGJhY2tzLFxuICBiaW5kUGlwZURlc3Ryb3lMaWZlY3ljbGVDYWxsYmFja3MsXG4gIGJpbmREaXJlY3RpdmVEZXRlY3RDaGFuZ2VzTGlmZWN5Y2xlQ2FsbGJhY2tzXG59IGZyb20gJy4vbGlmZWN5Y2xlX2JpbmRlcic7XG5pbXBvcnQge0NvbXBpbGVWaWV3fSBmcm9tICcuL2NvbXBpbGVfdmlldyc7XG5pbXBvcnQge0NvbXBpbGVFbGVtZW50LCBDb21waWxlTm9kZX0gZnJvbSAnLi9jb21waWxlX2VsZW1lbnQnO1xuXG5leHBvcnQgZnVuY3Rpb24gYmluZFZpZXcodmlldzogQ29tcGlsZVZpZXcsIHBhcnNlZFRlbXBsYXRlOiBUZW1wbGF0ZUFzdFtdKTogdm9pZCB7XG4gIHZhciB2aXNpdG9yID0gbmV3IFZpZXdCaW5kZXJWaXNpdG9yKHZpZXcpO1xuICB0ZW1wbGF0ZVZpc2l0QWxsKHZpc2l0b3IsIHBhcnNlZFRlbXBsYXRlKTtcbn1cblxuY2xhc3MgVmlld0JpbmRlclZpc2l0b3IgaW1wbGVtZW50cyBUZW1wbGF0ZUFzdFZpc2l0b3Ige1xuICBwcml2YXRlIF9ub2RlSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHZpZXc6IENvbXBpbGVWaWV3KSB7fVxuXG4gIHZpc2l0Qm91bmRUZXh0KGFzdDogQm91bmRUZXh0QXN0LCBwYXJlbnQ6IENvbXBpbGVFbGVtZW50KTogYW55IHtcbiAgICB2YXIgbm9kZSA9IHRoaXMudmlldy5ub2Rlc1t0aGlzLl9ub2RlSW5kZXgrK107XG4gICAgYmluZFJlbmRlclRleHQoYXN0LCBub2RlLCB0aGlzLnZpZXcpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0VGV4dChhc3Q6IFRleHRBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIHRoaXMuX25vZGVJbmRleCsrO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXROZ0NvbnRlbnQoYXN0OiBOZ0NvbnRlbnRBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIHZhciBjb21waWxlRWxlbWVudCA9IDxDb21waWxlRWxlbWVudD50aGlzLnZpZXcubm9kZXNbdGhpcy5fbm9kZUluZGV4KytdO1xuICAgIHZhciBldmVudExpc3RlbmVycyA9IGNvbGxlY3RFdmVudExpc3RlbmVycyhhc3Qub3V0cHV0cywgYXN0LmRpcmVjdGl2ZXMsIGNvbXBpbGVFbGVtZW50KTtcbiAgICBiaW5kUmVuZGVySW5wdXRzKGFzdC5pbnB1dHMsIGNvbXBpbGVFbGVtZW50KTtcbiAgICBiaW5kUmVuZGVyT3V0cHV0cyhldmVudExpc3RlbmVycyk7XG4gICAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChhc3QuZGlyZWN0aXZlcywgKGRpcmVjdGl2ZUFzdCwgaW5kZXgpID0+IHtcbiAgICAgIHZhciBkaXJlY3RpdmVJbnN0YW5jZSA9IGNvbXBpbGVFbGVtZW50LmRpcmVjdGl2ZUluc3RhbmNlc1tpbmRleF07XG4gICAgICBiaW5kRGlyZWN0aXZlSW5wdXRzKGRpcmVjdGl2ZUFzdCwgZGlyZWN0aXZlSW5zdGFuY2UsIGNvbXBpbGVFbGVtZW50KTtcbiAgICAgIGJpbmREaXJlY3RpdmVEZXRlY3RDaGFuZ2VzTGlmZWN5Y2xlQ2FsbGJhY2tzKGRpcmVjdGl2ZUFzdCwgZGlyZWN0aXZlSW5zdGFuY2UsIGNvbXBpbGVFbGVtZW50KTtcblxuICAgICAgYmluZERpcmVjdGl2ZUhvc3RQcm9wcyhkaXJlY3RpdmVBc3QsIGRpcmVjdGl2ZUluc3RhbmNlLCBjb21waWxlRWxlbWVudCk7XG4gICAgICBiaW5kRGlyZWN0aXZlT3V0cHV0cyhkaXJlY3RpdmVBc3QsIGRpcmVjdGl2ZUluc3RhbmNlLCBldmVudExpc3RlbmVycyk7XG4gICAgfSk7XG4gICAgdGVtcGxhdGVWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4sIGNvbXBpbGVFbGVtZW50KTtcbiAgICAvLyBhZnRlckNvbnRlbnQgYW5kIGFmdGVyVmlldyBsaWZlY3ljbGVzIG5lZWQgdG8gYmUgY2FsbGVkIGJvdHRvbSB1cFxuICAgIC8vIHNvIHRoYXQgY2hpbGRyZW4gYXJlIG5vdGlmaWVkIGJlZm9yZSBwYXJlbnRzXG4gICAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChhc3QuZGlyZWN0aXZlcywgKGRpcmVjdGl2ZUFzdCwgaW5kZXgpID0+IHtcbiAgICAgIHZhciBkaXJlY3RpdmVJbnN0YW5jZSA9IGNvbXBpbGVFbGVtZW50LmRpcmVjdGl2ZUluc3RhbmNlc1tpbmRleF07XG4gICAgICBiaW5kRGlyZWN0aXZlQWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzKGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUsIGRpcmVjdGl2ZUluc3RhbmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRWxlbWVudCk7XG4gICAgICBiaW5kRGlyZWN0aXZlQWZ0ZXJWaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzKGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUsIGRpcmVjdGl2ZUluc3RhbmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRWxlbWVudCk7XG4gICAgICBiaW5kRGlyZWN0aXZlRGVzdHJveUxpZmVjeWNsZUNhbGxiYWNrcyhkaXJlY3RpdmVBc3QuZGlyZWN0aXZlLCBkaXJlY3RpdmVJbnN0YW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbGVtZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShhc3Q6IEVtYmVkZGVkVGVtcGxhdGVBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIHZhciBjb21waWxlRWxlbWVudCA9IDxDb21waWxlRWxlbWVudD50aGlzLnZpZXcubm9kZXNbdGhpcy5fbm9kZUluZGV4KytdO1xuICAgIHZhciBldmVudExpc3RlbmVycyA9IGNvbGxlY3RFdmVudExpc3RlbmVycyhhc3Qub3V0cHV0cywgYXN0LmRpcmVjdGl2ZXMsIGNvbXBpbGVFbGVtZW50KTtcbiAgICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KGFzdC5kaXJlY3RpdmVzLCAoZGlyZWN0aXZlQXN0LCBpbmRleCkgPT4ge1xuICAgICAgdmFyIGRpcmVjdGl2ZUluc3RhbmNlID0gY29tcGlsZUVsZW1lbnQuZGlyZWN0aXZlSW5zdGFuY2VzW2luZGV4XTtcbiAgICAgIGJpbmREaXJlY3RpdmVJbnB1dHMoZGlyZWN0aXZlQXN0LCBkaXJlY3RpdmVJbnN0YW5jZSwgY29tcGlsZUVsZW1lbnQpO1xuICAgICAgYmluZERpcmVjdGl2ZURldGVjdENoYW5nZXNMaWZlY3ljbGVDYWxsYmFja3MoZGlyZWN0aXZlQXN0LCBkaXJlY3RpdmVJbnN0YW5jZSwgY29tcGlsZUVsZW1lbnQpO1xuICAgICAgYmluZERpcmVjdGl2ZU91dHB1dHMoZGlyZWN0aXZlQXN0LCBkaXJlY3RpdmVJbnN0YW5jZSwgZXZlbnRMaXN0ZW5lcnMpO1xuICAgICAgYmluZERpcmVjdGl2ZUFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrcyhkaXJlY3RpdmVBc3QuZGlyZWN0aXZlLCBkaXJlY3RpdmVJbnN0YW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVsZW1lbnQpO1xuICAgICAgYmluZERpcmVjdGl2ZUFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrcyhkaXJlY3RpdmVBc3QuZGlyZWN0aXZlLCBkaXJlY3RpdmVJbnN0YW5jZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVsZW1lbnQpO1xuICAgICAgYmluZERpcmVjdGl2ZURlc3Ryb3lMaWZlY3ljbGVDYWxsYmFja3MoZGlyZWN0aXZlQXN0LmRpcmVjdGl2ZSwgZGlyZWN0aXZlSW5zdGFuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRWxlbWVudCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEF0dHIoYXN0OiBBdHRyQXN0LCBjdHg6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjdHg6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RXZlbnQoYXN0OiBCb3VuZEV2ZW50QXN0LCBldmVudFRhcmdldEFuZE5hbWVzOiBNYXA8c3RyaW5nLCBCb3VuZEV2ZW50QXN0Pik6IGFueSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdFZhcmlhYmxlKGFzdDogVmFyaWFibGVBc3QsIGN0eDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXREaXJlY3RpdmVQcm9wZXJ0eShhc3Q6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG59XG4iXX0=