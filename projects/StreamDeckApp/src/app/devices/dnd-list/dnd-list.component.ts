/* eslint-disable @angular-eslint/component-selector */
import { Component, DestroyRef, ElementRef, inject, model } from '@angular/core';

@Component({
  selector: 'dnd-list',
  standalone: true,
  imports: [],
  template: `
    @for (key of available(); track key) {
      <a
        (keydown)="(void)"
        tabindex="1"
        [class.picked]="selected().includes(key)"
        (click)="toggleKey(key)"
        draggable="true"
        [attr.data-pos]="$index"
        [attr.data-key]="key"
        >{{ key }}
    </a>

    }
  `,
  styleUrl: './dnd-list.component.css',
})
export class DndListComponent {
  elm = inject(ElementRef).nativeElement as HTMLDivElement;
  dr = inject(DestroyRef);
  available = model.required<string[]>();
  selected = model.required<string[]>();

  toggleKey = (key: string) => {
    if (this.selected().includes(key)) {
      this.selected.update((keys) => keys.filter((k) => k !== key));
    } else {
      this.selected.update((keys) => keys.concat(key));
    }
  };

  void = () => undefined;

  constructor() {
    const observer = new MutationObserver((mutations) => {
      for (const record of mutations) {
        record.addedNodes.forEach((draggable: HTMLAnchorElement) => {
          // set up drag stuff on each added node.
          draggable.ondragstart = () => draggable.classList.add('dragging');
          draggable.ondragend = () => draggable.classList.remove('dragging');
        });
      }
    });
    observer.observe(this.elm, { childList: true });
    this.dr.onDestroy(() => {
      observer.disconnect();
    });
    const container = this.elm;
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientX, e.clientY);
      const draggable = document.querySelector('.dragging') as HTMLAnchorElement;
      if (afterElement == null) {
        container.appendChild(draggable);
        draggable.dataset.before=undefined
      } else {
        container.insertBefore(draggable, afterElement);
        draggable.dataset.before=afterElement.dataset.pos
      }
    });
    container.addEventListener('drop', (ev) => {
        const datalist = this.available();
        const tar = ev.target as HTMLAnchorElement
        const {before, pos} = tar.dataset||{}
        const orgText = datalist.splice(+pos!,1)[0] // read and remove from original position.
        if (before) {
          datalist.splice(+before,0,orgText)
        } else {
          datalist.push(orgText)
        }
        this.available.set(undefined)
        this.available.set(datalist);
        const selected = this.selected();
        this.selected.set(undefined)
        this.selected.set(datalist.filter((t) => selected.includes(t)));
    });
  }
}

function getDragAfterElement(container, x, y) {
  const draggableElements = [...container.querySelectorAll('a:not(.dragging)')];
  return draggableElements.reduce(
    (closest, child, index) => {
      const box = child.getBoundingClientRect();
      const nextBox = draggableElements[index + 1] && draggableElements[index + 1].getBoundingClientRect();
      const inRow = y - box.bottom <= 0 && y - box.top >= 0; // check if this is in the same row
      const offset = x - (box.left + box.width / 2);
      if (inRow) {
        if (offset < 0 && offset > closest.offset) {
          return {
            offset: offset,
            element: child,
          };
        } else {
          if (
            // handle row ends,
            nextBox && // there is a box after this one.
            y - nextBox.top <= 0 && // the next is in a new row
            closest.offset === Number.NEGATIVE_INFINITY // we didn't find a fit in the current row.
          ) {
            return {
              offset: 0,
              element: draggableElements[index + 1],
            };
          }
          return closest;
        }
      } else {
        return closest;
      }
    },
    {
      offset: Number.NEGATIVE_INFINITY,
    },
  ).element;
}
