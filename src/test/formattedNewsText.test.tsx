import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormattedNewsText } from '../components/FormattedNewsText';

describe('FormattedNewsText Component', () => {
  it('renders null if text is empty', () => {
    const { container } = render(<FormattedNewsText text="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders category headers for #### with or without markdown bold asterisks', () => {
    const input = `#### **Categoria 2020:**\nAlmagro Florida, Quilmes, Racing`;
    render(<FormattedNewsText text={input} />);

    // Should strip outer ** and render Categoria 2020: as a category pill
    expect(screen.getByText('Categoria 2020:')).toBeInTheDocument();
    expect(screen.getByText('Almagro Florida, Quilmes, Racing')).toBeInTheDocument();
  });

  it('renders lists with bullet items', () => {
    const input = `- Almagro Florida\n- Quilmes\n• Boca`;
    render(<FormattedNewsText text={input} />);

    expect(screen.getByText('Almagro Florida')).toBeInTheDocument();
    expect(screen.getByText('Quilmes')).toBeInTheDocument();
    expect(screen.getByText('Boca')).toBeInTheDocument();
  });

  it('renders inline bold, italic, and highlighted text', () => {
    const input = `Texto con **negrita** y *cursiva* y ==resaltado==`;
    render(<FormattedNewsText text={input} />);

    expect(screen.getByText('negrita')).toBeInTheDocument();
    expect(screen.getByText('cursiva')).toBeInTheDocument();
    expect(screen.getByText('resaltado')).toBeInTheDocument();
  });

  it('handles level 3 headings with an accent indicator', () => {
    const input = `### Comunicado Importante`;
    render(<FormattedNewsText text={input} />);

    expect(screen.getByText('Comunicado Importante')).toBeInTheDocument();
  });
});